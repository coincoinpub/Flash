import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import type { Dossier, Membre, Moment, PieceJointe, Statut } from '../types'
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

// Labellisation claire (légère) des champs, pour bien contraster avec les valeurs (foncées, en gras)
const LABEL_CLASS = 'text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide'

function AssignMulti({
  label,
  role,
  membres,
  values,
  onChange,
}: {
  label: string
  role: Membre['role']
  membres: Membre[]
  values: string[]
  onChange: (ids: string[]) => void
}) {
  const options = membres.filter((m) => m.role === role)
  const toggle = (id: string, coche: boolean) => {
    onChange(coche ? [...values, id] : values.filter((v) => v !== id))
  }
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-1.5">
        {options.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500 italic">Aucun membre</span>}
        {options.map((m) => (
          <label key={m.id} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={values.includes(m.id)}
              onChange={(e) => toggle(m.id, e.target.checked)}
            />
            <Avatar membre={m} size="sm" />
            {m.nom}
          </label>
        ))}
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

function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}

function iconePiece(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  return '📎'
}

function fichierEnBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function PiecesJointesSection({
  dossier,
  onUpdate,
}: {
  dossier: Dossier
  onUpdate: (patch: Partial<Dossier>) => void
}) {
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const ajouter = async (file: File) => {
    setEnvoiEnCours(true)
    setErreur(null)
    try {
      const contenuBase64 = await fichierEnBase64(file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossierId: dossier.id,
          nom: file.name,
          mimeType: file.type || 'application/octet-stream',
          contenuBase64,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? "échec de l'envoi")
      onUpdate({ piecesJointes: data.piecesJointes as PieceJointe[] })
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "échec de l'envoi")
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const supprimer = async (piece: PieceJointe) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId: dossier.id, pieceId: piece.id }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) onUpdate({ piecesJointes: data.piecesJointes as PieceJointe[] })
    } catch {
      // best effort
    }
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
      <div className={LABEL_CLASS}>Pièces jointes</div>

      {dossier.piecesJointes.length > 0 && (
        <ul className="space-y-1">
          {dossier.piecesJointes.map((piece) => (
            <li
              key={piece.id}
              className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/60 rounded-md px-2.5 py-1.5"
            >
              <span className="shrink-0">{iconePiece(piece.mimeType)}</span>
              <a
                href={piece.url}
                target="_blank"
                rel="noreferrer"
                className="truncate flex-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
              >
                {piece.nom}
              </a>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{formatTaille(piece.taille)}</span>
              <button
                type="button"
                onClick={() => supprimer(piece)}
                className="shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded p-0.5"
                aria-label={`Supprimer ${piece.nom}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) ajouter(file)
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={envoiEnCours}
        className="text-sm font-medium text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-600 rounded-md px-3 py-1.5 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 disabled:opacity-50"
      >
        {envoiEnCours ? 'Envoi…' : '+ Ajouter un fichier'}
      </button>
      {erreur && <div className="text-xs text-red-600 dark:text-red-400">{erreur}</div>}
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
    if (actif) {
      // Date/heure toujours renseignées dès l'activation (valeurs par défaut si besoin) pour
      // ne jamais laisser un RDV coché "en attente" et invisible tant que les deux champs
      // ne sont pas remplis manuellement.
      onUpdate({ rdv: { date: date || aujourdhui, heure: heure || '09:00', lieu } })
    } else {
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
            <div className="flex items-start gap-5">
              <div>
                <div className={LABEL_CLASS}>N° Devis</div>
                <EditableLine
                  value={dossier.reference}
                  onSave={(reference) => onUpdate({ reference })}
                  placeholder="DE0000"
                  alwaysVisiblePencil
                  textClassName="font-mono text-sm text-slate-500 dark:text-slate-400"
                  inputClassName="font-mono text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
                  pencilClassName="text-slate-400 dark:text-slate-500"
                />
              </div>
              <div>
                <div className={LABEL_CLASS}>N° Client</div>
                <EditableLine
                  value={dossier.numeroClient}
                  onSave={(numeroClient) => onUpdate({ numeroClient })}
                  placeholder="Ajouter…"
                  alwaysVisiblePencil
                  textClassName="font-mono text-sm text-slate-500 dark:text-slate-400"
                  inputClassName="font-mono text-sm border border-indigo-400 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800 dark:text-slate-100"
                  pencilClassName="text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>
            <EditableLine
              value={dossier.client}
              onSave={(client) => onUpdate({ client })}
              placeholder="Nom du Client"
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
            <div className={LABEL_CLASS}>Job</div>
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
              <div className={LABEL_CLASS}>Date</div>
              <input
                type="date"
                className="mt-0.5 border border-slate-300 dark:border-slate-600 rounded-md px-1.5 py-0.5 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                value={dossier.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
              />
            </div>
            <div>
              <div className={LABEL_CLASS}>Statut</div>
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
            <div className={LABEL_CLASS}>Qui fait quoi ?</div>
            <AssignMulti
              label="Commercial"
              role="commercial"
              membres={membres}
              values={dossier.commercialIds}
              onChange={(commercialIds) => onUpdate({ commercialIds })}
            />
            <AssignMulti
              label="PAO"
              role="pao"
              membres={membres}
              values={dossier.paoIds}
              onChange={(paoIds) => onUpdate({ paoIds })}
            />
            <AssignMulti
              label="Atelier"
              role="atelier"
              membres={membres}
              values={dossier.atelierIds}
              onChange={(atelierIds) => onUpdate({ atelierIds })}
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
            <div className={LABEL_CLASS}>Planification</div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rdvActif}
                  onChange={(e) => {
                    const actif = e.target.checked
                    setRdvActif(actif)
                    if (actif) {
                      const date = rdvDate || aujourdhui
                      const heure = rdvHeure || '09:00'
                      setRdvDate(date)
                      setRdvHeure(heure)
                      applyRdv(true, date, heure, rdvLieu)
                    } else {
                      applyRdv(false, rdvDate, rdvHeure, rdvLieu)
                    }
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
            <label className={LABEL_CLASS}>Note</label>
            <textarea
              className="w-full mt-1.5 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm min-h-28 resize-none bg-white dark:bg-slate-800 dark:text-slate-100"
              placeholder="Note libre sur le dossier…"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          <PiecesJointesSection dossier={dossier} onUpdate={onUpdate} />
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
