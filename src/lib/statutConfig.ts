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
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    header: 'bg-slate-200 text-slate-700',
  },
  bleu: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    header: 'bg-blue-100 text-blue-800',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
    header: 'bg-orange-100 text-orange-800',
  },
  ambre: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
    header: 'bg-amber-100 text-amber-900',
  },
  vert: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    header: 'bg-emerald-100 text-emerald-800',
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
