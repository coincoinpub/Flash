// Conversion entre le type Dossier (camelCase, utilisé dans toute l'app) et la ligne Supabase
// (snake_case, table `dossiers`). Fichier pur (pas de dépendance Vite) pour être importable
// aussi bien depuis le frontend que depuis les fonctions serverless (api/).
import type { Dossier, Moment, Statut } from '../types'

export interface GoogleEventIds {
  rdv?: string
  impression?: string
  pose_ext?: string
  pose_int?: string
  livraison?: string
  deadline?: string
}

export interface DossierRow {
  id: string
  reference: string
  numero_client: string
  client: string
  job: string
  statut: string
  ordre: number
  date: string
  commercial_ids: string[]
  pao_ids: string[]
  atelier_ids: string[]
  rdv: { date: string; heure: string; lieu: string } | null
  date_impression: string | null
  date_impression_moment: string
  date_livraison: string | null
  date_livraison_moment: string
  livraison_info: string
  deadline: string | null
  deadline_moment: string
  deadline_info: string
  pose_ext: string | null
  pose_ext_moment: string
  pose_ext_info: string
  pose_int: string | null
  pose_int_moment: string
  pose_int_info: string
  commentaire: string
  google_event_ids: GoogleEventIds
  updated_at?: string
}

export function dossierToRow(d: Dossier): Omit<DossierRow, 'updated_at'> {
  return {
    id: d.id,
    reference: d.reference,
    numero_client: d.numeroClient,
    client: d.client,
    job: d.job,
    statut: d.statut,
    ordre: d.ordre,
    date: d.date,
    commercial_ids: d.commercialIds,
    pao_ids: d.paoIds,
    atelier_ids: d.atelierIds,
    rdv: d.rdv,
    date_impression: d.dateImpression,
    date_impression_moment: d.dateImpressionMoment,
    date_livraison: d.dateLivraison,
    date_livraison_moment: d.dateLivraisonMoment,
    livraison_info: d.livraisonInfo,
    deadline: d.deadline,
    deadline_moment: d.deadlineMoment,
    deadline_info: d.deadlineInfo,
    pose_ext: d.poseExt,
    pose_ext_moment: d.poseExtMoment,
    pose_ext_info: d.poseExtInfo,
    pose_int: d.poseInt,
    pose_int_moment: d.poseIntMoment,
    pose_int_info: d.poseIntInfo,
    commentaire: d.commentaire,
    google_event_ids: {},
  }
}

const COLONNE_PAR_CLE: Record<keyof Dossier, keyof DossierRow> = {
  id: 'id',
  reference: 'reference',
  numeroClient: 'numero_client',
  client: 'client',
  job: 'job',
  statut: 'statut',
  ordre: 'ordre',
  date: 'date',
  commercialIds: 'commercial_ids',
  paoIds: 'pao_ids',
  atelierIds: 'atelier_ids',
  rdv: 'rdv',
  dateImpression: 'date_impression',
  dateImpressionMoment: 'date_impression_moment',
  dateLivraison: 'date_livraison',
  dateLivraisonMoment: 'date_livraison_moment',
  livraisonInfo: 'livraison_info',
  deadline: 'deadline',
  deadlineMoment: 'deadline_moment',
  deadlineInfo: 'deadline_info',
  poseExt: 'pose_ext',
  poseExtMoment: 'pose_ext_moment',
  poseExtInfo: 'pose_ext_info',
  poseInt: 'pose_int',
  poseIntMoment: 'pose_int_moment',
  poseIntInfo: 'pose_int_info',
  commentaire: 'commentaire',
}

// Ne convertit que les clés présentes dans le patch (mise à jour partielle Supabase), pour ne
// jamais écraser les autres colonnes d'un dossier lors d'une modification ciblée.
export function dossierPatchToRow(patch: Partial<Dossier>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const cle of Object.keys(patch) as (keyof Dossier)[]) {
    const colonne = COLONNE_PAR_CLE[cle]
    if (colonne) row[colonne] = patch[cle]
  }
  return row
}

export function rowToDossier(r: DossierRow): Dossier {
  return {
    id: r.id,
    reference: r.reference,
    numeroClient: r.numero_client,
    client: r.client,
    job: r.job,
    statut: r.statut as Statut,
    ordre: r.ordre,
    date: r.date,
    commercialIds: r.commercial_ids ?? [],
    paoIds: r.pao_ids ?? [],
    atelierIds: r.atelier_ids ?? [],
    rdv: r.rdv,
    dateImpression: r.date_impression,
    dateImpressionMoment: r.date_impression_moment as Moment,
    dateLivraison: r.date_livraison,
    dateLivraisonMoment: r.date_livraison_moment as Moment,
    livraisonInfo: r.livraison_info,
    deadline: r.deadline,
    deadlineMoment: r.deadline_moment as Moment,
    deadlineInfo: r.deadline_info,
    poseExt: r.pose_ext,
    poseExtMoment: r.pose_ext_moment as Moment,
    poseExtInfo: r.pose_ext_info,
    poseInt: r.pose_int,
    poseIntMoment: r.pose_int_moment as Moment,
    poseIntInfo: r.pose_int_info,
    commentaire: r.commentaire,
  }
}
