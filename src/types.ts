export type Statut =
  | 'nouveau'
  | 'devis_a_faire'
  | 'devis_en_cours'
  | 'pao_a_faire'
  | 'pao_en_cours'
  | 'a_imprimer'
  | 'pret'
  | 'a_facturer'
  | 'livre'
  | 'archive'

export const STATUTS: Statut[] = [
  'nouveau',
  'devis_a_faire',
  'devis_en_cours',
  'pao_a_faire',
  'pao_en_cours',
  'a_imprimer',
  'pret',
  'a_facturer',
  'livre',
  'archive',
]

export const STATUT_LABEL: Record<Statut, string> = {
  nouveau: 'Nouveau',
  devis_a_faire: 'Devis à faire',
  devis_en_cours: 'Devis en cours',
  pao_a_faire: 'PAO à faire',
  pao_en_cours: 'PAO en cours',
  a_imprimer: 'À imprimer',
  pret: 'Prêt',
  a_facturer: 'À facturer',
  livre: 'Livré',
  archive: 'Archivé',
}

export type Pole = 'impression' | 'signaletique'
export type RoleEquipe = 'commercial' | 'pao' | 'atelier'

export interface Membre {
  id: string
  nom: string
  initiales: string
  role: RoleEquipe
  pole: Pole | 'atelier'
  couleur: string
}

export interface Rdv {
  date: string // yyyy-MM-dd
  heure: string // HH:mm
  lieu: string // lieu du rendez-vous
}

// Demi-journée d'un évènement du planning
export type Moment = 'matin' | 'apres_midi'

export interface Dossier {
  id: string
  reference: string // DE0862
  numeroClient: string // 112785
  client: string
  job: string
  statut: Statut
  ordre: number // position manuelle dans sa colonne/groupe de statut
  date: string // yyyy-MM-dd — date de création / dossier
  commercialId: string | null
  paoId: string | null
  atelierId: string | null
  rdv: Rdv | null
  dateImpression: string | null
  dateImpressionMoment: Moment
  dateLivraison: string | null
  dateLivraisonMoment: Moment
  livraisonInfo: string
  deadline: string | null
  deadlineMoment: Moment
  deadlineInfo: string
  poseExt: string | null
  poseExtMoment: Moment
  poseExtInfo: string
  poseInt: string | null
  poseIntMoment: Moment
  poseIntInfo: string
  commentaire: string
  enChargeId: string | null
}
