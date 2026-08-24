import type { Statut } from '../types'

export type StatutCouleur = 'gris' | 'bleu' | 'orange' | 'ambre' | 'vert'

export const STATUT_COULEUR: Record<Statut, StatutCouleur> = {
  nouveau: 'gris',
  devis_a_faire: 'bleu',
  devis_en_cours: 'bleu',
  pao_a_faire: 'orange',
  pao_en_cours: 'orange',
  a_imprimer: 'ambre',
  pret: 'vert',
  a_facturer: 'bleu',
  livre: 'vert',
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
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-300',
    dot: 'bg-orange-500',
    header: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200',
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
}

export interface ColonneConfig {
  key: string
  titre: string
  couleur: StatutCouleur
  groupes: ColonneGroupe[]
}

export const COLONNES: ColonneConfig[] = [
  { key: 'nouveau', titre: 'Nouveau', couleur: 'gris', groupes: [{ statut: 'nouveau', label: 'Nouveau' }] },
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
    couleur: 'orange',
    groupes: [
      { statut: 'pao_a_faire', label: 'À faire' },
      { statut: 'pao_en_cours', label: 'En cours' },
    ],
  },
  { key: 'a_imprimer', titre: 'À imprimer', couleur: 'ambre', groupes: [{ statut: 'a_imprimer', label: 'À imprimer' }] },
  { key: 'pret', titre: 'Prêt', couleur: 'vert', groupes: [{ statut: 'pret', label: 'Prêt' }] },
  { key: 'a_facturer', titre: 'À facturer', couleur: 'bleu', groupes: [{ statut: 'a_facturer', label: 'À facturer' }] },
  { key: 'livre', titre: 'Livré', couleur: 'vert', groupes: [{ statut: 'livre', label: 'Livré' }] },
]
