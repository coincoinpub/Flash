import type { Dossier, Moment } from '../types'

export type EvenementType = 'rdv' | 'impression' | 'pose_ext' | 'pose_int' | 'livraison' | 'deadline'

export interface Evenement {
  id: string
  date: string
  moment: Moment
  type: EvenementType
  client: string
  info: string
  dossier: Dossier
}

export const EVENEMENT_STYLE: Record<EvenementType, { bg: string; text: string; label: string }> = {
  rdv: { bg: 'bg-red-500', text: 'text-white', label: 'RDV client' },
  impression: { bg: 'bg-blue-500', text: 'text-white', label: 'Job' },
  pose_ext: { bg: 'bg-orange-500', text: 'text-white', label: 'Pose ext.' },
  pose_int: { bg: 'bg-yellow-400', text: 'text-slate-900', label: 'Pose int.' },
  livraison: { bg: 'bg-emerald-500', text: 'text-white', label: 'Livraison' },
  deadline: { bg: 'bg-slate-700', text: 'text-white', label: 'Deadline' },
}

function momentDeRdv(heure: string): Moment {
  const heures = Number(heure.split(':')[0] ?? 12)
  return heures < 12 ? 'matin' : 'apres_midi'
}

export function libelleEvenement(ev: Evenement): string {
  if (ev.type === 'rdv' && ev.dossier.rdv) return `${EVENEMENT_STYLE.rdv.label} · ${ev.dossier.rdv.heure}`
  return EVENEMENT_STYLE[ev.type].label
}

export function placeholderInfo(type: EvenementType): string {
  switch (type) {
    case 'rdv':
      return 'Ajouter le lieu…'
    case 'impression':
      return 'Ajouter le job…'
    default:
      return 'Ajouter une info…'
  }
}

// Patch à appliquer au dossier quand la ligne "info" d'un évènement est modifiée depuis le planning.
export function patchInfoEvenement(ev: Evenement, valeur: string): Partial<Dossier> {
  switch (ev.type) {
    case 'rdv':
      return ev.dossier.rdv ? { rdv: { ...ev.dossier.rdv, lieu: valeur } } : {}
    case 'impression':
      return { job: valeur }
    case 'pose_ext':
      return { poseExtInfo: valeur }
    case 'pose_int':
      return { poseIntInfo: valeur }
    case 'livraison':
      return { livraisonInfo: valeur }
    case 'deadline':
      return { deadlineInfo: valeur }
  }
}

export function construireEvenements(dossiers: Dossier[]): Evenement[] {
  const evenements: Evenement[] = []
  for (const d of dossiers) {
    if (d.rdv) {
      evenements.push({
        id: `${d.id}-rdv`,
        date: d.rdv.date,
        moment: momentDeRdv(d.rdv.heure),
        type: 'rdv',
        client: d.client,
        info: d.rdv.lieu,
        dossier: d,
      })
    }
    if (d.dateImpression) {
      evenements.push({
        id: `${d.id}-impr`,
        date: d.dateImpression,
        moment: d.dateImpressionMoment,
        type: 'impression',
        client: d.client,
        info: d.job,
        dossier: d,
      })
    }
    if (d.poseExt) {
      evenements.push({
        id: `${d.id}-pext`,
        date: d.poseExt,
        moment: d.poseExtMoment,
        type: 'pose_ext',
        client: d.client,
        info: d.poseExtInfo,
        dossier: d,
      })
    }
    if (d.poseInt) {
      evenements.push({
        id: `${d.id}-pint`,
        date: d.poseInt,
        moment: d.poseIntMoment,
        type: 'pose_int',
        client: d.client,
        info: d.poseIntInfo,
        dossier: d,
      })
    }
    if (d.dateLivraison) {
      evenements.push({
        id: `${d.id}-liv`,
        date: d.dateLivraison,
        moment: d.dateLivraisonMoment,
        type: 'livraison',
        client: d.client,
        info: d.livraisonInfo,
        dossier: d,
      })
    }
    if (d.deadline) {
      evenements.push({
        id: `${d.id}-dl`,
        date: d.deadline,
        moment: d.deadlineMoment,
        type: 'deadline',
        client: d.client,
        info: d.deadlineInfo,
        dossier: d,
      })
    }
  }
  return evenements
}
