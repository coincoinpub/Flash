import type { Membre, Pole, RoleEquipe } from '../types'
import { Avatar } from './Avatar'
import { EditableLine } from './EditableLine'

interface Props {
  membres: Membre[]
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Membre>) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

const ROLES: { value: RoleEquipe; label: string }[] = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'pao', label: 'PAO' },
  { value: 'atelier', label: 'Atelier' },
]

const POLES: { value: Pole; label: string }[] = [
  { value: 'impression', label: 'Impression' },
  { value: 'signaletique', label: 'Signalétique' },
]

function initialesDe(nom: string): string {
  return (nom.trim()[0] ?? 'N').toUpperCase()
}

export function TeamPanel({ membres, onClose, onUpdate, onAdd, onRemove }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-[slidein_0.15s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">Équipe</div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {membres.map((m) => (
            <div key={m.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-2">
                <Avatar membre={m} />
                <EditableLine
                  value={m.nom}
                  onSave={(nom) => onUpdate(m.id, { nom, initiales: initialesDe(nom) })}
                  alwaysVisiblePencil
                  textClassName="font-semibold text-slate-800 dark:text-slate-100 text-sm"
                  inputClassName="flex-1 text-sm font-semibold border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
                  pencilClassName="text-slate-400 dark:text-slate-500"
                />
                <input
                  type="color"
                  value={m.couleur}
                  onChange={(e) => onUpdate(m.id, { couleur: e.target.value })}
                  className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 shrink-0 bg-transparent cursor-pointer"
                  aria-label="Couleur"
                />
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded p-1 shrink-0"
                  aria-label="Supprimer"
                  title="Supprimer ce membre"
                >
                  🗑
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <select
                  className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-slate-100"
                  value={m.role}
                  onChange={(e) => {
                    const role = e.target.value as RoleEquipe
                    onUpdate(m.id, { role, pole: role === 'atelier' ? 'atelier' : m.pole === 'atelier' ? 'impression' : m.pole })
                  }}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {m.role !== 'atelier' && (
                  <select
                    className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-slate-100"
                    value={m.pole}
                    onChange={(e) => onUpdate(m.id, { pole: e.target.value as Pole })}
                  >
                    {POLES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 text-sm font-medium py-2 transition"
          >
            <span className="text-base leading-none">+</span> Ajouter un membre
          </button>
        </div>
      </div>
    </div>
  )
}
