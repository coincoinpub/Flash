import { useCallback, useEffect, useState } from 'react'
import { MEMBRES } from '../data/mockData'
import type { Membre } from '../types'

const STORAGE_KEY = 'flash-crm-membres-v1'
const COULEURS_DEFAUT = ['#2563eb', '#0891b2', '#ea580c', '#d97706', '#16a34a', '#65a30d', '#9333ea', '#db2777']

function load(): Membre[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Membre[]
  } catch {
    // localStorage indisponible ou données corrompues : on repart des données de démo
  }
  return MEMBRES
}

export function useMembres() {
  const [membres, setMembres] = useState<Membre[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(membres))
    } catch {
      // stockage plein ou indisponible : on continue en mémoire seulement
    }
  }, [membres])

  const updateMembre = useCallback((id: string, patch: Partial<Membre>) => {
    setMembres((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
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
      return [...prev, nouveau]
    })
  }, [])

  const removeMembre = useCallback((id: string) => {
    setMembres((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { membres, updateMembre, addMembre, removeMembre }
}
