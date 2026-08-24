import type { Membre } from '../types'

export function Avatar({ membre, size = 'md' }: { membre: Membre | null | undefined; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-6 h-6 text-[10px]' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs'

  if (!membre) {
    return (
      <div
        className={`${dims} rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0`}
        title="Non assigné"
      >
        ?
      </div>
    )
  }

  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
      style={{ backgroundColor: membre.couleur }}
      title={membre.nom}
    >
      {membre.initiales}
    </div>
  )
}
