import { format } from 'date-fns'
import type { Dossier } from '../types'

export function construireNouveauDossier(dossiers: Dossier[]): Dossier {
  const ordresDevis = dossiers.filter((d) => d.statut === 'devis_a_faire').map((d) => d.ordre)
  return {
    id: `d-${Date.now()}`,
    reference: '',
    numeroClient: '',
    client: '',
    job: '',
    statut: 'devis_a_faire',
    ordre: ordresDevis.length > 0 ? Math.min(...ordresDevis) - 1 : 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    commercialIds: [],
    paoIds: [],
    atelierIds: [],
    rdv: null,
    dateImpression: null,
    dateImpressionMoment: 'matin',
    dateLivraison: null,
    dateLivraisonMoment: 'matin',
    livraisonInfo: '',
    deadline: null,
    deadlineMoment: 'matin',
    deadlineInfo: '',
    poseExt: null,
    poseExtMoment: 'matin',
    poseExtInfo: '',
    poseInt: null,
    poseIntMoment: 'apres_midi',
    poseIntInfo: '',
    commentaire: '',
  }
}
