import { Fragment, useState } from 'react'
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
  onDropAt: (statut: Statut, index: number) => void
  onCardClick: (dossier: Dossier) => void
  onCreateDossier?: () => void
  displayMode: boolean
}

interface GapCible {
  statut: Statut
  index: number
}

function DropGap({
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  isOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded transition-all ${isOver ? 'h-2 my-1 bg-indigo-400 dark:bg-indigo-500' : 'h-1.5'}`}
    />
  )
}

export function KanbanColumn({
  config,
  dossiersParStatut,
  membresParId,
  draggedId,
  onDragStart,
  onDragEnd,
  onDropAt,
  onCardClick,
  onCreateDossier,
  displayMode,
}: Props) {
  const [overGap, setOverGap] = useState<GapCible | null>(null)
  const classes = COULEUR_CLASSES[config.couleur]
  const total = config.groupes.reduce((n, g) => n + (dossiersParStatut[g.statut]?.length ?? 0), 0)

  return (
    <div className={`flex flex-col rounded-xl border ${classes.border} ${classes.bg} min-w-0 max-h-full`}>
      <div className={`px-2.5 py-2 rounded-t-xl font-semibold text-sm flex items-center justify-between ${classes.header}`}>
        <span className="truncate">{config.titre}</span>
        <span className="text-xs font-normal bg-white/60 dark:bg-black/20 rounded-full px-2 py-0.5 shrink-0">{total}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pt-2 pb-3">
        {onCreateDossier && (
          <button
            type="button"
            onClick={onCreateDossier}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 text-sm font-medium py-2 mb-2 transition"
          >
            <span className="text-base leading-none">+</span> Nouveau
          </button>
        )}
        {config.groupes.map((groupe) => {
          const items = dossiersParStatut[groupe.statut] ?? []
          return (
            <div key={groupe.statut} className="mb-2">
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
              {Array.from({ length: items.length + 1 }, (_, i) => i).map((i) => (
                <Fragment key={i}>
                  <DropGap
                    isOver={overGap?.statut === groupe.statut && overGap.index === i}
                    onDragOver={(e) => {
                      if (displayMode) return
                      e.preventDefault()
                      setOverGap({ statut: groupe.statut, index: i })
                    }}
                    onDragLeave={() =>
                      setOverGap((g) => (g?.statut === groupe.statut && g.index === i ? null : g))
                    }
                    onDrop={(e) => {
                      if (displayMode) return
                      e.preventDefault()
                      setOverGap(null)
                      onDropAt(groupe.statut, i)
                    }}
                  />
                  {items[i] && (
                    <DossierCard
                      dossier={items[i]}
                      enCharge={items[i].enChargeId ? (membresParId[items[i].enChargeId as string] ?? null) : null}
                      onClick={() => onCardClick(items[i])}
                      onDragStart={(e) => {
                        onDragStart(items[i].id)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={onDragEnd}
                      dragging={draggedId === items[i].id}
                      displayMode={displayMode}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
