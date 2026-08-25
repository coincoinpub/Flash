// Récap quotidien envoyé par email (Vercel Cron, voir vercel.json) — liste tout ce qui est
// planifié aujourd'hui (RDV, Job, pose, livraison, deadline) sur l'ensemble des dossiers.
//
// Vercel Cron ne connaît que l'UTC : on programme DEUX déclenchements par jour (06:30 et 07:30
// UTC, qui couvrent 8h30 heure de Paris été comme hiver) et cette fonction n'envoie l'email que
// si l'heure de Paris est bien 8h — avec un verrou anti-doublon (table rappels_envoyes) au cas où
// les deux déclenchements tombent dans la fenêtre le même jour.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getGmailClient, googleConfigured, buildRawEmail } from '../_lib/google.js'
import { construireEvenements, EVENEMENT_STYLE, libelleEvenement } from '../../src/lib/planning.ts'
import { rowToDossier, type DossierRow } from '../../src/lib/dossierRow.ts'

const EXPEDITEUR = 'crm.flashimpression@gmail.com'
const DESTINATAIRE = process.env.RAPPEL_DESTINATAIRE || EXPEDITEUR

function dateEtHeureParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { jour: `${get('year')}-${get('month')}-${get('day')}`, heure: Number(get('hour')) }
}

function construireEmail(jour: string, evenementsDuJour: ReturnType<typeof construireEvenements>) {
  const dateLisible = new Date(`${jour}T12:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  if (evenementsDuJour.length === 0) {
    return {
      subject: `Rien de planifié aujourd'hui — ${dateLisible}`,
      html: `<p>Aucune échéance (RDV, job, pose, livraison, deadline) planifiée aujourd'hui.</p>`,
    }
  }

  const parMoment = { matin: evenementsDuJour.filter((e) => e.moment === 'matin'), apres_midi: evenementsDuJour.filter((e) => e.moment === 'apres_midi') }

  const ligne = (ev: (typeof evenementsDuJour)[number]) =>
    `<li><strong>${libelleEvenement(ev)}</strong> — ${ev.client}${ev.dossier.job ? ` (${ev.dossier.job})` : ''}${ev.info ? ` · ${ev.info}` : ''}</li>`

  const section = (titre: string, evs: typeof evenementsDuJour) =>
    evs.length === 0 ? '' : `<h3>${titre}</h3><ul>${evs.map(ligne).join('')}</ul>`

  return {
    subject: `Rappel Flash Impression — ${evenementsDuJour.length} échéance${evenementsDuJour.length > 1 ? 's' : ''} — ${dateLisible}`,
    html: `
      <h2>Planning du ${dateLisible}</h2>
      ${section('Matin', parMoment.matin)}
      ${section('Après-midi', parMoment.apres_midi)}
    `,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel ajoute automatiquement ce header sur les appels Cron réels quand CRON_SECRET est
  // défini — ça évite que n'importe qui déclenche l'envoi en devinant l'URL.
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    res.status(200).json({ skipped: 'supabase non configuré' })
    return
  }
  if (!googleConfigured()) {
    res.status(200).json({ skipped: 'google non configuré' })
    return
  }

  const { jour, heure } = dateEtHeureParis()
  if (heure !== 8) {
    res.status(200).json({ skipped: `hors fenêtre (il est ${heure}h à Paris)` })
    return
  }

  // Verrou anti-doublon : si l'insertion échoue, le rappel du jour a déjà été envoyé.
  const { error: verrouError } = await admin.from('rappels_envoyes').insert({ jour })
  if (verrouError) {
    res.status(200).json({ skipped: 'déjà envoyé aujourd\'hui' })
    return
  }

  try {
    const { data: rows } = await admin.from('dossiers').select('*').neq('statut', 'archive')
    const dossiers = (rows ?? []).map((r) => rowToDossier(r as DossierRow))
    const tousEvenements = construireEvenements(dossiers)
    const evenementsDuJour = tousEvenements
      .filter((ev) => ev.date === jour)
      .sort((a, b) => Object.keys(EVENEMENT_STYLE).indexOf(a.type) - Object.keys(EVENEMENT_STYLE).indexOf(b.type))

    const { subject, html } = construireEmail(jour, evenementsDuJour)
    const gmail = getGmailClient()
    if (gmail) {
      const raw = buildRawEmail({ from: EXPEDITEUR, to: DESTINATAIRE, subject, html })
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
    }

    res.status(200).json({ ok: true, jour, nbEvenements: evenementsDuJour.length })
  } catch (err) {
    console.error('rappel-quotidien error', err)
    res.status(500).json({ error: 'rappel failed' })
  }
}
