export type Statut =
  | 'devis_a_faire'
  | 'devis_en_cours'
  | 'pao_a_faire'
  | 'pao_en_cours'
  | 'a_imprimer_bat'
  | 'a_imprimer_prod'
  | 'a_facturer'
  | 'livre'
  | 'archive'

export const STATUTS: Statut[] = [
  'devis_a_faire',
  'devis_en_cours',
  'pao_a_faire',
  'pao_en_cours',
  'a_imprimer_bat',
  'a_imprimer_prod',
  'a_facturer',
  'livre',
  'archive',
]

export const STATUT_LABEL: Record<Statut, string> = {
  devis_a_faire: 'Devis à faire',
  devis_en_cours: 'Devis en cours',
  pao_a_faire: 'PAO à faire',
  pao_en_cours: 'PAO en cours',
  a_imprimer_bat: 'BAT',
  a_imprimer_prod: 'En prod',
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

// Fichier joint à un dossier (logo, photo, devis, facture, BAT…), stocké sur le Google Drive
// du compte crm.flashimpression@gmail.com — voir SETUP.md.
export interface PieceJointe {
  id: string
  nom: string
  url: string
  mimeType: string
  taille: number // octets
  ajouteLe: string // yyyy-MM-dd
}

export interface Dossier {
  id: string
  reference: string // DE0862
  numeroClient: string // 112785
  client: string
  job: string
  statut: Statut
  ordre: number // position manuelle dans sa colonne/groupe de statut
  date: string // yyyy-MM-dd — date de création / dossier
  commercialIds: string[]
  paoIds: string[]
  atelierIds: string[]
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
  piecesJointes: PieceJointe[]
}
