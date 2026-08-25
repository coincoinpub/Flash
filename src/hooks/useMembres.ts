import { useCallback, useEffect, useState } from 'react'
import { MEMBRES } from '../data/mockData'
import type { Membre } from '../types'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

const STORAGE_KEY = 'flash-crm-membres-v1'
const COULEURS_DEFAUT = ['#2563eb', '#0891b2', '#ea580c', '#d97706', '#16a34a', '#65a30d', '#9333ea', '#db2777']

function loadLocal(): Membre[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Membre[]
  } catch {
    // localStorage indisponible ou données corrompues : on repart des données de démo
  }
  return MEMBRES
}

export function useMembres() {
  const [membres, setMembres] = useState<Membre[]>(supabaseConfigured ? [] : loadLocal)

  useEffect(() => {
    if (!supabase) return
    let annule = false

    supabase
      .from('membres')
      .select('*')
      .then(({ data, error }) => {
        if (annule || error || !data) return
        setMembres(data as Membre[])
      })

    const channel = supabase
      .channel('membres-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const idSupprime = (payload.old as Partial<Membre>).id
          setMembres((prev) => prev.filter((m) => m.id !== idSupprime))
          return
        }
        const incoming = payload.new as Membre
        setMembres((prev) => {
          const existe = prev.some((m) => m.id === incoming.id)
          return existe ? prev.map((m) => (m.id === incoming.id ? incoming : m)) : [...prev, incoming]
        })
      })
      .subscribe()

    return () => {
      annule = true
      supabase?.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (supabaseConfigured) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(membres))
    } catch {
      // stockage plein ou indisponible : on continue en mémoire seulement
    }
  }, [membres])

  const updateMembre = useCallback((id: string, patch: Partial<Membre>) => {
    setMembres((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    if (supabase) supabase.from('membres').update(patch).eq('id', id)
  }, [])

  const addMembre = useCallback(() => {
    setMembres((prev) => {
      const couleur = COULEURS_DEFAUT[prev.length % COULEURS_DEFAUT.length]
      const nouveau: Membre = {
        id: `m-${Date.now()}`,
        nom: 'Nouveau membre',
        initiales: 'N',
        role: 'commercial',
        pole: 'impression',
        couleur,
      }
      if (supabase) supabase.from('membres').insert(nouveau)
      return [...prev, nouveau]
    })
  }, [])

  const removeMembre = useCallback((id: string) => {
    setMembres((prev) => prev.filter((m) => m.id !== id))
    if (supabase) supabase.from('membres').delete().eq('id', id)
  }, [])

  return { membres, updateMembre, addMembre, removeMembre }
}
