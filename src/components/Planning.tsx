import { useMemo } from 'react'
import { addDays, format, isToday, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Dossier } from '../types'
import { construireEvenements, EVENEMENT_STYLE } from '../lib/planning'

interface Props {
  dossiers: Dossier[]
  onSelectDossier: (dossier: Dossier) => void
  displayMode: boolean
}

export function Planning({ dossiers, onSelectDossier, displayMode }: Props) {
  const evenements = useMemo(() => construireEvenements(dossiers), [dossiers])

  const semaines = useMemo(() => {
    const lundiCourant = startOfWeek(new Date(), { weekStartsOn: 1 })
    return [0, 1, 2].map((s) => {
      const lundi = addDays(lundiCourant, s * 7)
      return [0, 1, 2, 3, 4].map((j) => addDays(lundi, j))
    })
  }, [])

  const evenementsParJour = useMemo(() => {
    const map = new Map<string, typeof evenements>()
    for (const ev of evenements) {
      const arr = map.get(ev.date) ?? []
      arr.push(ev)
      map.set(ev.date, arr)
    }
    return map
  }, [evenements])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Planning — 3 semaines</h2>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
          {(Object.keys(EVENEMENT_STYLE) as (keyof typeof EVENEMENT_STYLE)[]).map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${EVENEMENT_STYLE[type].bg}`} />
              {EVENEMENT_STYLE[type].label}
            </span>
          ))}
        </div>
      </div>

      <div className={`grid gap-3 ${displayMode ? 'grid-cols-1' : 'grid-cols-1'}`}>
        {semaines.map((semaine, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            {semaine.map((jour) => {
              const cle = format(jour, 'yyyy-MM-dd')
              const evs = evenementsParJour.get(cle) ?? []
              const aujourdhui = isToday(jour)
              return (
                <div
                  key={cle}
                  className={`rounded-lg border px-2 py-2 min-h-24 bg-white dark:bg-slate-800 ${
                    aujourdhui
                      ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-300 dark:ring-indigo-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold mb-1.5 flex items-center justify-between ${
                      aujourdhui ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{format(jour, 'EEE dd MMM', { locale: fr })}</span>
                    {aujourdhui && <span className="text-[10px] uppercase">Aujourd'hui</span>}
                  </div>
                  <div className="space-y-1">
                    {evs.map((ev) => {
                      const style = EVENEMENT_STYLE[ev.type]
                      return (
                        <button
                          type="button"
                          key={ev.id}
                          onClick={() => onSelectDossier(ev.dossier)}
                          className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text} hover:opacity-90`}
                          title={`${ev.dossier.reference} — ${ev.label}`}
                        >
                          {ev.dossier.reference} · {ev.label}
                        </button>
                      )
                    })}
                    {evs.length === 0 && <div className="text-[11px] text-slate-300 dark:text-slate-600 select-none">—</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
