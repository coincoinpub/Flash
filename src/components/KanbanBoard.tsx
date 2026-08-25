import { useMemo, useState } from 'react'
import type { Dossier, Membre, Statut } from '../types'
import { COLONNES } from '../lib/statutConfig'
import { KanbanColumn } from './KanbanColumn'

interface Props {
  dossiers: Dossier[]
  membresParId: Record<string, Membre>
  onMove: (id: string, statut: Statut) => void
  onCardClick: (dossier: Dossier) => void
  onUpdateDossier: (id: string, patch: Partial<Dossier>) => void
  displayMode: boolean
}

export function KanbanBoard({ dossiers, membresParId, onMove, onCardClick, onUpdateDossier, displayMode }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const dossiersParStatut = useMemo(() => {
    const map = {} as Record<Statut, Dossier[]>
    for (const colonne of COLONNES) {
      for (const groupe of colonne.groupes) map[groupe.statut] = []
    }
    for (const d of dossiers) {
      map[d.statut]?.push(d)
    }
    return map
  }, [dossiers])

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: displayMode ? '70vh' : '520px' }}>
      {COLONNES.map((config) => (
        <KanbanColumn
          key={config.key}
          config={config}
          dossiersParStatut={dossiersParStatut}
          membresParId={membresParId}
          draggedId={draggedId}
          onDragStart={setDraggedId}
          onDragEnd={() => setDraggedId(null)}
          onDrop={(statut) => {
            if (draggedId) onMove(draggedId, statut)
            setDraggedId(null)
          }}
          onCardClick={onCardClick}
          onUpdateDossier={onUpdateDossier}
          displayMode={displayMode}
        />
      ))}
    </div>
  )
}
