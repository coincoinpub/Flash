import { useMemo } from 'react'
import { addDays, format, getDay, isToday, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Dossier, Moment } from '../types'
import { construireEvenements, EVENEMENT_STYLE, libelleEvenement } from '../lib/planning'
import type { Evenement } from '../lib/planning'

interface Props {
  dossiers: Dossier[]
  onSelectDossier: (dossier: Dossier) => void
  displayMode: boolean
}

// Hauteur de référence (visuelle) : 2 places par demi-journée. Au-delà, toutes les cartes
// réelles s'affichent quand même — ce n'est qu'un minimum, pas un plafond.
const PLACES_PAR_DEMI_JOURNEE = 2

function EvenementChip({ ev, onSelectDossier }: { ev: Evenement; onSelectDossier: (dossier: Dossier) => void }) {
  const style = EVENEMENT_STYLE[ev.type]
  return (
    <button
      type="button"
      onClick={() => onSelectDossier(ev.dossier)}
      className={`w-full text-left rounded px-2 py-2 mb-1 cursor-pointer ${style.bg} ${style.text}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-90 truncate">{libelleEvenement(ev)}</div>
      <div className="text-base font-bold leading-tight truncate">{ev.client}</div>
      {ev.info && <div className="text-sm leading-tight opacity-90 truncate">{ev.info}</div>}
    </button>
  )
}

function DemiJournee({
  label,
  evenements,
  zoneTampon,
  onSelectDossier,
}: {
  label: string
  evenements: Evenement[]
  zoneTampon: boolean
  onSelectDossier: (dossier: Dossier) => void
}) {
  const placesVides = Math.max(0, PLACES_PAR_DEMI_JOURNEE - evenements.length)

  return (
    <div className={`rounded-md px-1 py-1 ${zoneTampon ? 'bg-orange-100 dark:bg-orange-950/40' : ''}`}>
      <div className="flex items-center justify-between px-0.5 mb-1">
        <span
          className={`text-[9px] font-semibold uppercase tracking-wide ${
            zoneTampon ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {label}
        </span>
        {zoneTampon && (
          <span className="text-[8px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-200 bg-orange-200 dark:bg-orange-900/60 rounded px-1 py-0.5">
            Zone tampon
          </span>
        )}
      </div>
      {evenements.map((ev) => (
        <EvenementChip key={ev.id} ev={ev} onSelectDossier={onSelectDossier} />
      ))}
      {Array.from({ length: placesVides }, (_, i) => (
        <div key={i} className="h-3.5 mb-1 border-b border-dashed border-slate-200 dark:border-slate-700/70" />
      ))}
    </div>
  )
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

  const evenementsParCreneau = useMemo(() => {
    const map = new Map<string, Evenement[]>()
    for (const ev of evenements) {
      const cle = `${ev.date}|${ev.moment}`
      const arr = map.get(cle) ?? []
      arr.push(ev)
      map.set(cle, arr)
    }
    return map
  }, [evenements])

  const evenementsDuCreneau = (date: string, moment: Moment) => evenementsParCreneau.get(`${date}|${moment}`) ?? []

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
              const aujourdhui = isToday(jour)
              const estVendredi = getDay(jour) === 5
              return (
                <div
                  key={cle}
                  className={`rounded-lg border bg-white dark:bg-slate-800 ${
                    aujourdhui
                      ? 'border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-300 dark:ring-indigo-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold px-2 pt-2 pb-1 flex items-center justify-between ${
                      aujourdhui ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{format(jour, 'EEE dd MMM', { locale: fr })}</span>
                    {aujourdhui && <span className="text-[10px] uppercase">Aujourd'hui</span>}
                  </div>
                  <div className="px-1.5 pb-1.5 space-y-1.5">
                    <DemiJournee
                      label="Matin"
                      evenements={evenementsDuCreneau(cle, 'matin')}
                      zoneTampon={false}
                      onSelectDossier={onSelectDossier}
                    />
                    <DemiJournee
                      label="Après-midi"
                      evenements={evenementsDuCreneau(cle, 'apres_midi')}
                      zoneTampon={estVendredi}
                      onSelectDossier={onSelectDossier}
                    />
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
