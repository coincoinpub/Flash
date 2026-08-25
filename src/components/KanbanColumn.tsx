import { useState } from 'react'
import type { Dossier, Membre, Statut } from '../types'
import { COULEUR_CLASSES, type ColonneConfig } from '../lib/statutConfig'
import { DossierCard } from './DossierCard'

interface Props {
  config: ColonneConfig
  dossiersParStatut: Record<Statut, Dossier[]>
  membresParId: Record<string, Membre>
  draggedId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (statut: Statut) => void
  onCardClick: (dossier: Dossier) => void
  onUpdateDossier: (id: string, patch: Partial<Dossier>) => void
  displayMode: boolean
}

export function KanbanColumn({
  config,
  dossiersParStatut,
  membresParId,
  draggedId,
  onDragStart,
  onDragEnd,
  onDrop,
  onCardClick,
  onUpdateDossier,
  displayMode,
}: Props) {
  const [overStatut, setOverStatut] = useState<Statut | null>(null)
  const classes = COULEUR_CLASSES[config.couleur]
  const total = config.groupes.reduce((n, g) => n + (dossiersParStatut[g.statut]?.length ?? 0), 0)

  return (
    <div className={`flex flex-col rounded-xl border ${classes.border} ${classes.bg} shrink-0 w-72 max-h-full`}>
      <div className={`px-3 py-2 rounded-t-xl font-semibold text-sm flex items-center justify-between ${classes.header}`}>
        <span>{config.titre}</span>
        <span className="text-xs font-normal bg-white/60 dark:bg-black/20 rounded-full px-2 py-0.5">{total}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-3">
        {config.groupes.map((groupe) => {
          const items = dossiersParStatut[groupe.statut] ?? []
          const isOver = overStatut === groupe.statut
          return (
            <div
              key={groupe.statut}
              onDragOver={(e) => {
                if (displayMode) return
                e.preventDefault()
                setOverStatut(groupe.statut)
              }}
              onDragLeave={() => setOverStatut((s) => (s === groupe.statut ? null : s))}
              onDrop={(e) => {
                if (displayMode) return
                e.preventDefault()
                setOverStatut(null)
                onDrop(groupe.statut)
              }}
              className={`rounded-lg mb-2 p-1 transition ${
                isOver ? 'bg-white dark:bg-slate-900 ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900' : ''
              }`}
            >
              {config.groupes.length > 1 && (
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-1 mb-1 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${classes.dot}`} />
                  {groupe.label}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({items.length})</span>
                </div>
              )}
              {items.length === 0 && (
                <div className="text-[11px] text-slate-400 dark:text-slate-600 italic px-1 py-1 select-none">Aucun dossier</div>
              )}
              {items.map((dossier) => (
                <DossierCard
                  key={dossier.id}
                  dossier={dossier}
                  enCharge={dossier.enChargeId ? (membresParId[dossier.enChargeId] ?? null) : null}
                  onClick={() => onCardClick(dossier)}
                  onUpdate={(patch) => onUpdateDossier(dossier.id, patch)}
                  onDragStart={(e) => {
                    onDragStart(dossier.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={onDragEnd}
                  dragging={draggedId === dossier.id}
                  displayMode={displayMode}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
