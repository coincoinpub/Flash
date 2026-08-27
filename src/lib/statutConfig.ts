import type { Statut } from '../types'

export type StatutCouleur = 'gris' | 'bleu' | 'violet' | 'ambre' | 'vert'

export const STATUT_COULEUR: Record<Statut, StatutCouleur> = {
  devis_a_faire: 'bleu',
  devis_en_cours: 'bleu',
  pao_a_faire: 'violet',
  pao_en_cours: 'violet',
  a_imprimer_bat: 'ambre',
  a_imprimer_prod: 'ambre',
  a_facturer: 'bleu',
  livre: 'vert',
  archive: 'gris',
}

export const COULEUR_CLASSES: Record<
  StatutCouleur,
  { bg: string; border: string; text: string; dot: string; header: string }
> = {
  gris: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
    header: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },
  bleu: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    dot: 'bg-blue-500',
    header: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-300 dark:border-violet-800',
    text: 'text-violet-800 dark:text-violet-300',
    dot: 'bg-violet-500',
    header: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
  },
  ambre: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-400 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-300',
    dot: 'bg-amber-500',
    header: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
  },
  vert: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    header: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  },
}

export interface ColonneGroupe {
  statut: Statut
  label: string
  /** Rendu compact (cartes réduites) — utilisé pour l'archive. */
  compact?: boolean
}

export interface ColonneConfig {
  key: string
  titre: string
  couleur: StatutCouleur
  groupes: ColonneGroupe[]
}

export const COLONNES: ColonneConfig[] = [
  {
    key: 'devis',
    titre: 'Devis',
    couleur: 'bleu',
    groupes: [
      { statut: 'devis_a_faire', label: 'À faire' },
      { statut: 'devis_en_cours', label: 'En cours' },
    ],
  },
  {
    key: 'pao',
    titre: 'PAO',
    couleur: 'violet',
    groupes: [
      { statut: 'pao_a_faire', label: 'À faire' },
      { statut: 'pao_en_cours', label: 'En cours' },
    ],
  },
  {
    key: 'a_imprimer',
    titre: 'À imprimer',
    couleur: 'ambre',
    groupes: [
      { statut: 'a_imprimer_bat', label: 'BAT' },
      { statut: 'a_imprimer_prod', label: 'En prod' },
    ],
  },
  { key: 'a_facturer', titre: 'À facturer', couleur: 'bleu', groupes: [{ statut: 'a_facturer', label: 'À facturer' }] },
]

// Livré et Archive empilés dans une seule colonne, tout à droite : un seul défilement vertical
// pour descendre de l'un à l'autre. L'archive est rendue en compact pour rester discrète.
export const COLONNE_LIVRE_ARCHIVE: ColonneConfig = {
  key: 'livre_archive',
  titre: 'Livré / Archive',
  couleur: 'vert',
  groupes: [
    { statut: 'livre', label: 'Livré' },
    { statut: 'archive', label: 'Archive', compact: true },
  ],
}
