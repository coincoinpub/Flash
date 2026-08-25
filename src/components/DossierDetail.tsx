import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import type { Dossier, Membre, Moment, Statut } from '../types'
import { STATUT_LABEL, STATUTS } from '../types'
import { COULEUR_CLASSES, STATUT_COULEUR } from '../lib/statutConfig'
import { EVENEMENT_STYLE, placeholderInfo } from '../lib/planning'
import type { EvenementType } from '../lib/planning'
import { Avatar } from './Avatar'
import { EditableLine } from './EditableLine'

interface Props {
  dossier: Dossier
  membres: Membre[]
  onClose: () => void
  onUpdate: (patch: Partial<Dossier>) => void
  onArchive: () => void
  onDelete: () => void
}

function AssignSelect({
  label,
  role,
  membres,
  value,
  onChange,
}: {
  label: string
  role: Membre['role']
  membres: Membre[]
  value: string | null
  onChange: (id: string | null) => void
}) {
  const options = membres.filter((m) => m.role === role)
  const selected = options.find((m) => m.id === value) ?? null
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <Avatar membre={selected} />
        <select
          className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">Non assigné</option>
          {options.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function DateMomentInfo({
  type,
  date,
  moment,
  info,
  onDate,
  onMoment,
  onInfo,
}: {
  type: EvenementType
  date: string
  moment: Moment
  info?: string
  onDate: (date: string) => void
  onMoment: (moment: Moment) => void
  onInfo?: (info: string) => void
}) {
  return (
    <div className="ml-5 mt-1.5 space-y-1.5">
      <div className="flex gap-2">
        <input
          type="date"
          className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          value={date}
          onChange={(e) => onDate(e.target.value)}
        />
        <select
          className="border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          value={moment}
          onChange={(e) => onMoment(e.target.value as Moment)}
        >
          <option value="matin">Matin</option>
          <option value="apres_midi">Après-midi</option>
        </select>
      </div>
      {onInfo && (
        <EditableLine
          value={info ?? ''}
          placeholder={placeholderInfo(type)}
          onSave={onInfo}
          alwaysVisiblePencil
          textClassName="text-sm text-slate-700 dark:text-slate-300"
          inputClassName="w-full text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
          pencilClassName="text-slate-400 dark:text-slate-500"
        />
      )}
    </div>
  )
}

export function DossierDetail({ dossier, membres, onClose, onUpdate, onArchive, onDelete }: Props) {
  const [commentaire, setCommentaire] = useState(dossier.commentaire)
  const [rdvActif, setRdvActif] = useState(!!dossier.rdv)
  const [rdvDate, setRdvDate] = useState(dossier.rdv?.date ?? '')
  const [rdvHeure, setRdvHeure] = useState(dossier.rdv?.heure ?? '')
  const [rdvLieu, setRdvLieu] = useState(dossier.rdv?.lieu ?? '')

  useEffect(() => {
    setCommentaire(dossier.commentaire)
    setRdvActif(!!dossier.rdv)
    setRdvDate(dossier.rdv?.date ?? '')
    setRdvHeure(dossier.rdv?.heure ?? '')
    setRdvLieu(dossier.rdv?.lieu ?? '')
  }, [dossier.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      if (commentaire !== dossier.commentaire) onUpdate({ commentaire })
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentaire])

  const applyRdv = (actif: boolean, date: string, heure: string, lieu: string) => {
    if (actif && date && heure) {
      onUpdate({ rdv: { date, heure, lieu } })
    } else if (!actif) {
      onUpdate({ rdv: null })
    }
  }

  const couleur = COULEUR_CLASSES[STATUT_COULEUR[dossier.statut]]
  const aujourdhui = format(new Date(), 'yyyy-MM-dd')

  const lignesEvenements = [
    {
      type: 'impression' as const,
      date: dossier.dateImpression,
      moment: dossier.dateImpressionMoment,
      onToggle: (actif: boolean) => onUpdate({ dateImpression: actif ? aujourdhui : null }),
      onDate: (date: string) => onUpdate({ dateImpression: date }),
      onMoment: (dateImpressionMoment: Moment) => onUpdate({ dateImpressionMoment }),
    },
    {
      type: 'pose_ext' as const,
      date: dossier.poseExt,
      moment: dossier.poseExtMoment,
      info: dossier.poseExtInfo,
      onToggle: (actif: boolean) => onUpdate({ poseExt: actif ? aujourdhui : null }),
      onDate: (date: string) => onUpdate({ poseExt: date }),
      onMoment: (poseExtMoment: Moment) => onUpdate({ poseExtMoment }),
      onInfo: (poseExtInfo: string) => onUpdate({ poseExtInfo }),
    },
    {
      type: 'pose_int' as const,
      date: dossier.poseInt,
      moment: dossier.poseIntMoment,
      info: dossier.poseIntInfo,
      onToggle: (actif: boolean) => onUpdate({ poseInt: actif ? aujourdhui : null }),
      onDate: (date: string) => onUpdate({ poseInt: date }),
      onMoment: (poseIntMoment: Moment) => onUpdate({ poseIntMoment }),
      onInfo: (poseIntInfo: string) => onUpdate({ poseIntInfo }),
    },
    {
      type: 'livraison' as const,
      date: dossier.dateLivraison,
      moment: dossier.dateLivraisonMoment,
      info: dossier.livraisonInfo,
      onToggle: (actif: boolean) => onUpdate({ dateLivraison: actif ? aujourdhui : null }),
      onDate: (date: string) => onUpdate({ dateLivraison: date }),
      onMoment: (dateLivraisonMoment: Moment) => onUpdate({ dateLivraisonMoment }),
      onInfo: (livraisonInfo: string) => onUpdate({ livraisonInfo }),
    },
    {
      type: 'deadline' as const,
      date: dossier.deadline,
      moment: dossier.deadlineMoment,
      info: dossier.deadlineInfo,
      onToggle: (actif: boolean) => onUpdate({ deadline: actif ? aujourdhui : null }),
      onDate: (date: string) => onUpdate({ deadline: date }),
      onMoment: (deadlineMoment: Moment) => onUpdate({ deadlineMoment }),
      onInfo: (deadlineInfo: string) => onUpdate({ deadlineInfo }),
    },
  ]

  const handleDelete = () => {
    if (window.confirm(`Supprimer définitivement le dossier ${dossier.client} ?`)) onDelete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col animate-[popin_0.15s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="min-w-0">
            <EditableLine
              value={dossier.reference}
              onSave={(reference) => onUpdate({ reference })}
              placeholder="DE0000"
              alwaysVisiblePencil
              textClassName="font-mono text-sm text-slate-500 dark:text-slate-400"
              inputClassName="font-mono text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
              pencilClassName="text-slate-400 dark:text-slate-500"
            />
            <EditableLine
              value={dossier.client}
              onSave={(client) => onUpdate({ client })}
              alwaysVisiblePencil
              textClassName="text-lg font-semibold text-slate-800 dark:text-slate-100"
              inputClassName="text-lg font-semibold border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
              pencilClassName="text-slate-400 dark:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <EditableLine
              value={dossier.job}
              onSave={(job) => onUpdate({ job })}
              alwaysVisiblePencil
              textClassName="text-sm text-slate-600 dark:text-slate-400"
              inputClassName="w-full text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
              pencilClassName="text-slate-400 dark:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">N° client</div>
              <EditableLine
                value={dossier.numeroClient}
                onSave={(numeroClient) => onUpdate({ numeroClient })}
                placeholder="Ajouter…"
                alwaysVisiblePencil
                textClassName="font-mono mt-0.5 dark:text-slate-200"
                inputClassName="w-full font-mono text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
                pencilClassName="text-slate-400 dark:text-slate-500"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</div>
              <input
                type="date"
                className="mt-0.5 border border-slate-300 dark:border-slate-600 rounded-md px-1.5 py-0.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                value={dossier.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Statut</div>
              <select
                className={`mt-0.5 text-xs font-semibold rounded-full px-2 py-1 border-0 ${couleur.header}`}
                value={dossier.statut}
                onChange={(e) => onUpdate({ statut: e.target.value as Statut })}
              >
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qui fait quoi</div>
            <AssignSelect
              label="Commercial"
              role="commercial"
              membres={membres}
              value={dossier.commercialId}
              onChange={(id) => onUpdate({ commercialId: id })}
            />
            <AssignSelect
              label="PAO"
              role="pao"
              membres={membres}
              value={dossier.paoId}
              onChange={(id) => onUpdate({ paoId: id })}
            />
            <AssignSelect
              label="Atelier"
              role="atelier"
              membres={membres}
              value={dossier.atelierId}
              onChange={(id) => onUpdate({ atelierId: id })}
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Planification</div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rdvActif}
                  onChange={(e) => {
                    setRdvActif(e.target.checked)
                    applyRdv(e.target.checked, rdvDate, rdvHeure, rdvLieu)
                  }}
                />
                <span className={`w-2 h-2 rounded-sm ${EVENEMENT_STYLE.rdv.bg}`} />
                {EVENEMENT_STYLE.rdv.label}
              </label>
              {rdvActif && (
                <div className="ml-5 space-y-1.5 mt-1.5">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                      value={rdvDate}
                      onChange={(e) => {
                        setRdvDate(e.target.value)
                        applyRdv(true, e.target.value, rdvHeure, rdvLieu)
                      }}
                    />
                    <input
                      type="time"
                      className="w-28 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                      value={rdvHeure}
                      onChange={(e) => {
                        setRdvHeure(e.target.value)
                        applyRdv(true, rdvDate, e.target.value, rdvLieu)
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Lieu du rendez-vous"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                    value={rdvLieu}
                    onChange={(e) => {
                      setRdvLieu(e.target.value)
                      applyRdv(true, rdvDate, rdvHeure, e.target.value)
                    }}
                  />
                </div>
              )}
            </div>

            {lignesEvenements.map((ligne) => (
              <div key={ligne.type}>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={!!ligne.date} onChange={(e) => ligne.onToggle(e.target.checked)} />
                  <span className={`w-2 h-2 rounded-sm ${EVENEMENT_STYLE[ligne.type].bg}`} />
                  {EVENEMENT_STYLE[ligne.type].label}
                </label>
                {ligne.date && (
                  <DateMomentInfo
                    type={ligne.type}
                    date={ligne.date}
                    moment={ligne.moment}
                    info={'info' in ligne ? ligne.info : undefined}
                    onDate={ligne.onDate}
                    onMoment={ligne.onMoment}
                    onInfo={'onInfo' in ligne ? ligne.onInfo : undefined}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Commentaire</label>
            <textarea
              className="w-full mt-1.5 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm min-h-28 resize-none bg-white dark:bg-slate-800 dark:text-slate-100"
              placeholder="Note libre sur le dossier…"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={onArchive}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md px-3 py-1.5 flex items-center gap-1.5"
          >
            🗄 Archiver
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md px-3 py-1.5 flex items-center gap-1.5"
          >
            🗑 Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
