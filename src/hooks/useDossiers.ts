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

  const moveDossier = useCallback((id: string, statut: Statut) => {
    setDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, statut } : d)))
  }, [])

  const resetDemo = useCallback(() => {
    setDossiers(DOSSIERS)
  }, [])

  return { dossiers, updateDossier, moveDossier, resetDemo }
}
