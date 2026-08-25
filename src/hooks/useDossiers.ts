import { useCallback, useEffect, useRef, useState } from 'react'
import { DOSSIERS } from '../data/mockData'
import type { Dossier, Statut } from '../types'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'
import { dossierPatchToRow, dossierToRow, rowToDossier, type DossierRow } from '../lib/dossierRow'
import { triggerSync } from '../lib/triggerSync'

const STORAGE_KEY = 'flash-crm-dossiers-v1'

function loadLocal(): Dossier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Dossier[]
  } catch {
    // localStorage indisponible ou données corrompues : on repart des données de démo
  }
  return DOSSIERS
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>(supabaseConfigured ? [] : loadLocal)
  // Reflète toujours le dernier état, pour construire des updates Supabase cohérentes sans
  // dépendre de `dossiers` dans les useCallback (ce qui les recréerait à chaque changement).
  const dossiersRef = useRef(dossiers)
  useEffect(() => {
    dossiersRef.current = dossiers
  }, [dossiers])

  // Chargement initial + abonnement temps réel Supabase (plusieurs postes restent synchronisés).
  useEffect(() => {
    if (!supabase) return
    let annule = false

    supabase
      .from('dossiers')
      .select('*')
      .then(({ data, error }) => {
        if (annule || error || !data) return
        setDossiers((data as DossierRow[]).map(rowToDossier))
      })

    const channel = supabase
      .channel('dossiers-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dossiers' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const idSupprime = (payload.old as Partial<DossierRow>).id
          setDossiers((prev) => prev.filter((d) => d.id !== idSupprime))
          return
        }
        const incoming = rowToDossier(payload.new as DossierRow)
        setDossiers((prev) => {
          const existe = prev.some((d) => d.id === incoming.id)
          return existe ? prev.map((d) => (d.id === incoming.id ? incoming : d)) : [incoming, ...prev]
        })
      })
      .subscribe()

    return () => {
      annule = true
      supabase?.removeChannel(channel)
    }
  }, [])

  // Fallback localStorage tant que Supabase n'est pas configuré (voir SETUP.md).
  useEffect(() => {
    if (supabaseConfigured) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers))
    } catch {
      // stockage plein ou indisponible : on continue en mémoire seulement
    }
  }, [dossiers])

  const updateDossier = useCallback((id: string, patch: Partial<Dossier>) => {
    setDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    if (supabase) {
      supabase
        .from('dossiers')
        .update(dossierPatchToRow(patch))
        .eq('id', id)
        .then(() => triggerSync(id, 'upsert'))
    }
  }, [])

  // Déplace/réordonne un dossier : le place à `index` parmi les dossiers du statut cible,
  // puis renumérote tout le groupe pour garder un ordre dense et cohérent.
  const reorderDossier = useCallback((id: string, statut: Statut, index: number) => {
    const prev = dossiersRef.current
    const dragged = prev.find((d) => d.id === id)
    if (!dragged) return
    const groupe = prev.filter((d) => d.statut === statut && d.id !== id).sort((a, b) => a.ordre - b.ordre)
    const indexBorne = Math.max(0, Math.min(index, groupe.length))
    groupe.splice(indexBorne, 0, dragged)
    const ordreParId = new Map(groupe.map((d, i) => [d.id, i]))

    const suivant = prev.map((d) => {
      if (d.id === id) return { ...d, statut, ordre: ordreParId.get(id) ?? 0 }
      if (d.statut === statut && ordreParId.has(d.id)) return { ...d, ordre: ordreParId.get(d.id)! }
      return d
    })
    setDossiers(suivant)

    if (supabase) {
      const lignesModifiees = suivant
        .filter((d) => d.id === id || (d.statut === statut && ordreParId.has(d.id)))
        .map((d) => ({ id: d.id, statut: d.statut, ordre: d.ordre }))
      supabase
        .from('dossiers')
        .upsert(lignesModifiees)
        .then(() => triggerSync(id, 'upsert'))
    }
  }, [])

  const addDossier = useCallback((dossier: Dossier) => {
    setDossiers((prev) => [dossier, ...prev])
    if (supabase) {
      supabase
        .from('dossiers')
        .insert(dossierToRow(dossier))
        .then(() => triggerSync(dossier.id, 'upsert'))
    }
  }, [])

  const removeDossier = useCallback(async (id: string) => {
    await triggerSync(id, 'delete')
    setDossiers((prev) => prev.filter((d) => d.id !== id))
    if (supabase) await supabase.from('dossiers').delete().eq('id', id)
  }, [])

  // Retire toute référence à un membre supprimé (assignations) sans toucher au reste du dossier.
  const clearMembreReferences = useCallback((membreId: string) => {
    const prev = dossiersRef.current
    const concernes = prev.filter(
      (d) => d.commercialIds.includes(membreId) || d.paoIds.includes(membreId) || d.atelierIds.includes(membreId),
    )
    setDossiers((p) =>
      p.map((d) => ({
        ...d,
        commercialIds: d.commercialIds.filter((id) => id !== membreId),
        paoIds: d.paoIds.filter((id) => id !== membreId),
        atelierIds: d.atelierIds.filter((id) => id !== membreId),
      })),
    )
    if (supabase) {
      for (const d of concernes) {
        supabase
          .from('dossiers')
          .update({
            commercial_ids: d.commercialIds.filter((id) => id !== membreId),
            pao_ids: d.paoIds.filter((id) => id !== membreId),
            atelier_ids: d.atelierIds.filter((id) => id !== membreId),
          })
          .eq('id', d.id)
      }
    }
  }, [])

  return { dossiers, updateDossier, reorderDossier, addDossier, removeDossier, clearMembreReferences }
}
