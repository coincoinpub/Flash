import { useCallback, useEffect, useState } from 'react'
import { DOSSIERS } from '../data/mockData'
import type { Dossier, Statut } from '../types'

const STORAGE_KEY = 'flash-crm-dossiers-v1'

function load(): Dossier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Dossier[]
  } catch {
    // localStorage indisponible ou données corrompues : on repart des données de démo
  }
  return DOSSIERS
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers))
    } catch {
      // stockage plein ou indisponible : on continue en mémoire seulement
    }
  }, [dossiers])

  const updateDossier = useCallback((id: string, patch: Partial<Dossier>) => {
    setDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])

  // Déplace/réordonne un dossier : le place à `index` parmi les dossiers du statut cible,
  // puis renumérote tout le groupe pour garder un ordre dense et cohérent.
  const reorderDossier = useCallback((id: string, statut: Statut, index: number) => {
    setDossiers((prev) => {
      const dragged = prev.find((d) => d.id === id)
      if (!dragged) return prev
      const groupe = prev.filter((d) => d.statut === statut && d.id !== id).sort((a, b) => a.ordre - b.ordre)
      const indexBorne = Math.max(0, Math.min(index, groupe.length))
      groupe.splice(indexBorne, 0, dragged)
      const ordreParId = new Map(groupe.map((d, i) => [d.id, i]))
      return prev.map((d) => {
        if (d.id === id) return { ...d, statut, ordre: ordreParId.get(id) ?? 0 }
        if (d.statut === statut && ordreParId.has(d.id)) return { ...d, ordre: ordreParId.get(d.id)! }
        return d
      })
    })
  }, [])

  const addDossier = useCallback((dossier: Dossier) => {
    setDossiers((prev) => [dossier, ...prev])
  }, [])

  const removeDossier = useCallback((id: string) => {
    setDossiers((prev) => prev.filter((d) => d.id !== id))
  }, [])

  // Retire toute référence à un membre supprimé (assignations) sans toucher au reste du dossier.
  const clearMembreReferences = useCallback((membreId: string) => {
    setDossiers((prev) =>
      prev.map((d) => ({
        ...d,
        commercialIds: d.commercialIds.filter((id) => id !== membreId),
        paoIds: d.paoIds.filter((id) => id !== membreId),
        atelierIds: d.atelierIds.filter((id) => id !== membreId),
      })),
    )
  }, [])

  const resetDemo = useCallback(() => {
    setDossiers(DOSSIERS)
  }, [])

  return { dossiers, updateDossier, reorderDossier, addDossier, removeDossier, clearMembreReferences, resetDemo }
}
