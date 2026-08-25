import { format } from 'date-fns'
import type { Dossier } from '../types'

export function construireNouveauDossier(dossiers: Dossier[]): Dossier {
  const ordresNouveau = dossiers.filter((d) => d.statut === 'nouveau').map((d) => d.ordre)
  return {
    id: `d-${Date.now()}`,
    reference: '',
    numeroClient: '',
    client: 'Nouveau dossier',
    job: '',
    statut: 'nouveau',
    ordre: ordresNouveau.length > 0 ? Math.min(...ordresNouveau) - 1 : 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    commercialId: null,
    paoId: null,
    atelierId: null,
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
    enChargeId: null,
  }
}
