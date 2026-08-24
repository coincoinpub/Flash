import { useEffect, useState } from 'react'
import type { Dossier, Membre, Statut } from '../types'
import { STATUT_LABEL, STATUTS } from '../types'
import { COULEUR_CLASSES, STATUT_COULEUR } from '../lib/statutConfig'
import { Avatar } from './Avatar'

interface Props {
  dossier: Dossier
  membres: Membre[]
  onClose: () => void
  onUpdate: (patch: Partial<Dossier>) => void
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
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <Avatar membre={selected} />
        <select
          className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white"
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

export function DossierDetail({ dossier, membres, onClose, onUpdate }: Props) {
  const [commentaire, setCommentaire] = useState(dossier.commentaire)
  const [rdvActif, setRdvActif] = useState(!!dossier.rdv)
  const [rdvDate, setRdvDate] = useState(dossier.rdv?.date ?? '')
  const [rdvHeure, setRdvHeure] = useState(dossier.rdv?.heure ?? '')

  useEffect(() => {
    setCommentaire(dossier.commentaire)
    setRdvActif(!!dossier.rdv)
    setRdvDate(dossier.rdv?.date ?? '')
    setRdvHeure(dossier.rdv?.heure ?? '')
  }, [dossier.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      if (commentaire !== dossier.commentaire) onUpdate({ commentaire })
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentaire])

  const applyRdv = (actif: boolean, date: string, heure: string) => {
    if (actif && date && heure) {
      onUpdate({ rdv: { date, heure } })
    } else if (!actif) {
      onUpdate({ rdv: null })
    }
  }

  const couleur = COULEUR_CLASSES[STATUT_COULEUR[dossier.statut]]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slidein_0.15s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <div className="font-mono text-sm text-slate-500">{dossier.reference}</div>
            <div className="text-lg font-semibold text-slate-800">{dossier.client}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <div className="text-sm text-slate-600">{dossier.job}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">N° devis</div>
              <div className="font-mono mt-0.5">{dossier.reference}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">N° client</div>
              <div className="font-mono mt-0.5">{dossier.numeroClient}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</div>
              <div className="mt-0.5">{dossier.date}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</div>
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

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Qui fait quoi</div>
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

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rdvActif}
                  onChange={(e) => {
                    setRdvActif(e.target.checked)
                    applyRdv(e.target.checked, rdvDate, rdvHeure)
                  }}
                />
                Rendez-vous
              </label>
              {rdvActif && (
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="date"
                    className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    value={rdvDate}
                    onChange={(e) => {
                      setRdvDate(e.target.value)
                      applyRdv(true, e.target.value, rdvHeure)
                    }}
                  />
                  <input
                    type="time"
                    className="w-28 border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                    value={rdvHeure}
                    onChange={(e) => {
                      setRdvHeure(e.target.value)
                      applyRdv(true, rdvDate, e.target.value)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Commentaire</label>
            <textarea
              className="w-full mt-1.5 border border-slate-300 rounded-md px-3 py-2 text-sm min-h-28 resize-none"
              placeholder="Note libre sur le dossier…"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
