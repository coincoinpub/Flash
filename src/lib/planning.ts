import type { Dossier } from '../types'

export type EvenementType = 'rdv' | 'impression' | 'pose_ext' | 'pose_int' | 'livraison' | 'deadline'

export interface Evenement {
  id: string
  date: string
  type: EvenementType
  label: string
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

export function construireEvenements(dossiers: Dossier[]): Evenement[] {
  const evenements: Evenement[] = []
  for (const d of dossiers) {
    if (d.rdv) {
      evenements.push({ id: `${d.id}-rdv`, date: d.rdv.date, type: 'rdv', label: `${d.rdv.heure} ${d.client}`, dossier: d })
    }
    if (d.dateImpression) {
      evenements.push({ id: `${d.id}-impr`, date: d.dateImpression, type: 'impression', label: d.job, dossier: d })
    }
    if (d.poseExt) {
      evenements.push({ id: `${d.id}-pext`, date: d.poseExt, type: 'pose_ext', label: d.client, dossier: d })
    }
    if (d.poseInt) {
      evenements.push({ id: `${d.id}-pint`, date: d.poseInt, type: 'pose_int', label: d.client, dossier: d })
    }
    if (d.dateLivraison) {
      evenements.push({ id: `${d.id}-liv`, date: d.dateLivraison, type: 'livraison', label: d.client, dossier: d })
    }
    if (d.deadline) {
      evenements.push({ id: `${d.id}-dl`, date: d.deadline, type: 'deadline', label: d.client, dossier: d })
    }
  }
  return evenements
}
