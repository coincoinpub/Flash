import { useMemo, useState } from 'react'
import type { Dossier, Membre, Statut } from '../types'
import { COLONNES } from '../lib/statutConfig'
import { KanbanColumn } from './KanbanColumn'

interface Props {
  dossiers: Dossier[]
  membresParId: Record<string, Membre>
  onReorder: (id: string, statut: Statut, index: number) => void
  onCardClick: (dossier: Dossier) => void
  onCreateDossier: () => void
  displayMode: boolean
}

export function KanbanBoard({ dossiers, membresParId, onReorder, onCardClick, onCreateDossier, displayMode }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const dossiersParStatut = useMemo(() => {
    const map = {} as Record<Statut, Dossier[]>
    for (const colonne of COLONNES) {
      for (const groupe of colonne.groupes) map[groupe.statut] = []
    }
    for (const d of dossiers) {
      map[d.statut]?.push(d)
    }
    for (const statut of Object.keys(map) as Statut[]) {
      map[statut].sort((a, b) => a.ordre - b.ordre)
    }
    return map
  }, [dossiers])

  return (
    <div
      className="grid gap-2 overflow-x-auto pb-1"
      style={{ gridTemplateColumns: `repeat(${COLONNES.length}, minmax(150px, 1fr))`, minHeight: displayMode ? '70vh' : '520px' }}
    >
      {COLONNES.map((config) => (
        <KanbanColumn
          key={config.key}
          config={config}
          dossiersParStatut={dossiersParStatut}
          membresParId={membresParId}
          draggedId={draggedId}
          onDragStart={setDraggedId}
          onDragEnd={() => setDraggedId(null)}
          onDropAt={(statut, index) => {
            if (draggedId) onReorder(draggedId, statut, index)
            setDraggedId(null)
          }}
          onCardClick={onCardClick}
          onCreateDossier={config.key === 'nouveau' ? onCreateDossier : undefined}
          displayMode={displayMode}
        />
      ))}
    </div>
  )
}
