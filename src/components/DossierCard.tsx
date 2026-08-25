import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Dossier, Membre } from '../types'
import { Avatar } from './Avatar'

interface Props {
  dossier: Dossier
  enCharge: Membre | null
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  dragging: boolean
  displayMode: boolean
}

export function DossierCard({ dossier, enCharge, onClick, onDragStart, onDragEnd, dragging, displayMode }: Props) {
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
      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-1 leading-snug">{dossier.client}</div>
      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-snug">{dossier.job}</div>
      <div className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5">
        {format(parseISO(dossier.date), 'dd MMM', { locale: fr })}
        {dossier.rdv && <span className="ml-2 text-red-600 dark:text-red-400 font-medium">RDV {dossier.rdv.heure}</span>}
      </div>
    </button>
  )
}
