import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Dossier, Membre } from '../types'
import { construireEvenements, EVENEMENT_STYLE } from '../lib/planning'
import { Avatar } from './Avatar'

interface Props {
  dossier: Dossier
  enCharge: Membre | null
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  dragging: boolean
  displayMode: boolean
  compact?: boolean
}

export function DossierCard({ dossier, enCharge, onClick, onDragStart, onDragEnd, dragging, displayMode, compact }: Props) {
  // Prochaine échéance planning du dossier (RDV, deadline, pose, livraison…) — recalculée à
  // chaque changement de dossier, pour que la carte reflète immédiatement les dates modifiées
  // dans la fiche détail plutôt que de rester figée sur la seule date de création.
  const prochaineEcheance = useMemo(() => {
    const evenements = construireEvenements([dossier])
    if (evenements.length === 0) return null
    return [...evenements].sort((a, b) => a.date.localeCompare(b.date))[0]
  }, [dossier])

  if (compact) {
    return (
      <button
        type="button"
        draggable={!displayMode}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        className={`w-full text-left bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 mb-1 flex items-center gap-1.5 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer ${
          dragging ? 'opacity-40' : ''
        } ${displayMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{dossier.reference || '—'}</span>
        <span className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1">{dossier.client}</span>
        <Avatar membre={enCharge} size="sm" />
      </button>
    )
  }

  return (
    <button
      type="button"
      draggable={!displayMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none px-3 py-2.5 mb-2 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer ${
        dragging ? 'opacity-40' : ''
      } ${displayMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">{dossier.reference}</span>
        <Avatar membre={enCharge} size="sm" />
      </div>
      <div className="font-semibold text-slate-800 dark:text-slate-100 text-base mt-1 leading-snug">{dossier.client}</div>
      <div className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-snug">{dossier.job}</div>
      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{format(parseISO(dossier.date), 'dd MMM', { locale: fr })}</span>
        {prochaineEcheance && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${EVENEMENT_STYLE[prochaineEcheance.type].bg} ${EVENEMENT_STYLE[prochaineEcheance.type].text}`}
          >
            {EVENEMENT_STYLE[prochaineEcheance.type].label} {format(parseISO(prochaineEcheance.date), 'dd MMM', { locale: fr })}
            {prochaineEcheance.type === 'rdv' && dossier.rdv ? ` ${dossier.rdv.heure}` : ''}
          </span>
        )}
      </div>
    </button>
  )
}
