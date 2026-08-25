import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Dossier, Membre } from '../types'
import { Avatar } from './Avatar'
import { EditableLine } from './EditableLine'

interface Props {
  dossier: Dossier
  enCharge: Membre | null
  onClick: () => void
  onUpdate: (patch: Partial<Dossier>) => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  dragging: boolean
  displayMode: boolean
}

export function DossierCard({
  dossier,
  enCharge,
  onClick,
  onUpdate,
  onDragStart,
  onDragEnd,
  dragging,
  displayMode,
}: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={!displayMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`w-full text-left bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none px-3 py-2.5 mb-2 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer ${
        dragging ? 'opacity-40' : ''
      } ${displayMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">{dossier.reference}</span>
        <Avatar membre={enCharge} size="sm" />
      </div>
      <div className="mt-1">
        <EditableLine
          value={dossier.client}
          onSave={(client) => onUpdate({ client })}
          textClassName="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug"
          inputClassName="w-full font-semibold text-sm border border-indigo-400 rounded px-1 py-0.5 bg-white dark:bg-slate-900 dark:text-slate-100"
          pencilClassName="text-slate-400 dark:text-slate-500"
        />
      </div>
      <div className="mt-0.5">
        <EditableLine
          value={dossier.job}
          onSave={(job) => onUpdate({ job })}
          textClassName="text-slate-500 dark:text-slate-400 text-xs leading-snug"
          inputClassName="w-full text-xs border border-indigo-400 rounded px-1 py-0.5 bg-white dark:bg-slate-900 dark:text-slate-100"
          pencilClassName="text-slate-400 dark:text-slate-500"
        />
      </div>
      <div className="text-slate-400 dark:text-slate-500 text-[11px] mt-1.5">
        {format(parseISO(dossier.date), 'dd MMM', { locale: fr })}
        {dossier.rdv && <span className="ml-2 text-red-600 dark:text-red-400 font-medium">RDV {dossier.rdv.heure}</span>}
      </div>
    </div>
  )
}
