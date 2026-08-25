import { useMemo, useState } from 'react'
import type { Dossier, Membre, Statut } from '../types'
import { COLONNE_LIVRE_ARCHIVE, COLONNES } from '../lib/statutConfig'
import { KanbanColumn } from './KanbanColumn'

interface Props {
  dossiers: Dossier[]
  membresParId: Record<string, Membre>
  onReorder: (id: string, statut: Statut, index: number) => void
  onCardClick: (dossier: Dossier) => void
  onCreateDossier: () => void
  displayMode: boolean
}

const TOUTES_COLONNES = [...COLONNES, COLONNE_LIVRE_ARCHIVE]

export function KanbanBoard({ dossiers, membresParId, onReorder, onCardClick, onCreateDossier, displayMode }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const dossiersParStatut = useMemo(() => {
    const map = {} as Record<Statut, Dossier[]>
    for (const colonne of TOUTES_COLONNES) {
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

  const hauteur = displayMode ? '70vh' : '520px'

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ minHeight: hauteur }}>
      {!displayMode && (
        <div className="w-9 shrink-0 flex justify-center pt-0.5">
          <button
            type="button"
            onClick={onCreateDossier}
            className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 flex items-center justify-center text-xl leading-none transition"
            aria-label="Nouvelle carte"
            title="Nouvelle carte"
          >
            +
          </button>
        </div>
      )}
      <div
        className="grid gap-2 flex-1"
        style={{ gridTemplateColumns: `repeat(${TOUTES_COLONNES.length}, minmax(160px, 1fr))` }}
      >
        {TOUTES_COLONNES.map((config) => (
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
            displayMode={displayMode}
          />
        ))}
      </div>
    </div>
  )
}
