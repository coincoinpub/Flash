// Synchronisation best-effort vers Google Calendar + Google Sheet, déclenchée par le
// frontend après chaque création/modification/suppression de dossier (voir src/hooks/useDossiers.ts).
// Ne bloque jamais la sauvegarde principale (Supabase) : si Google n'est pas encore configuré,
// répond simplement "non configuré" sans erreur.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { getCalendarClient, getSheetsClient, googleConfigured } from './_lib/google.js'
import { construireEvenements, EVENEMENT_STYLE, type EvenementType } from '../src/lib/planning.ts'
import { rowToDossier, type DossierRow, type GoogleEventIds } from '../src/lib/dossierRow.ts'
import { STATUT_LABEL } from '../src/types.ts'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary'
const SHEET_ID = process.env.GOOGLE_SHEET_ID
const TIMEZONE = 'Europe/Paris'

const CRENEAU_HEURES: Record<'matin' | 'apres_midi', { debut: string; fin: string }> = {
  matin: { debut: '08:00:00', fin: '12:00:00' },
  apres_midi: { debut: '14:00:00', fin: '18:00:00' },
}

function eventTimeRange(type: EvenementType, date: string, moment: 'matin' | 'apres_midi', heureRdv?: string) {
  if (type === 'rdv' && heureRdv) {
    const [h, m] = heureRdv.split(':')
    const debut = `${date}T${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}:00`
    const finHeure = Math.min(23, Number(h) + 1)
    const fin = `${date}T${String(finHeure).padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}:00`
    return { start: debut, end: fin }
  }
  const creneau = CRENEAU_HEURES[moment]
  return { start: `${date}T${creneau.debut}`, end: `${date}T${creneau.fin}` }
}

async function syncCalendrier(row: DossierRow) {
  const calendar = getCalendarClient()
  if (!calendar) return null

  const dossier = rowToDossier(row)
  const evenements = construireEvenements([dossier])
  const parType = new Map(evenements.map((ev) => [ev.type, ev]))
  const eventIds: GoogleEventIds = { ...row.google_event_ids }

  for (const type of Object.keys(EVENEMENT_STYLE) as EvenementType[]) {
    const ev = parType.get(type)
    const existingId = eventIds[type]

    if (!ev) {
      // Plus de date pour ce type de planification : on retire l'évènement calendrier s'il existait.
      if (existingId) {
        await calendar.events.delete({ calendarId: CALENDAR_ID, eventId: existingId }).catch(() => {})
        delete eventIds[type]
      }
      continue
    }

    const { start, end } = eventTimeRange(type, ev.date, ev.moment, type === 'rdv' ? dossier.rdv?.heure : undefined)
    const summary = `${EVENEMENT_STYLE[type].label} — ${ev.client}`
    const descriptionLignes = [dossier.job, ev.info, `Statut : ${STATUT_LABEL[dossier.statut]}`].filter(Boolean)
    const requestBody = {
      summary,
      description: descriptionLignes.join('\n'),
      start: { dateTime: start, timeZone: TIMEZONE },
      end: { dateTime: end, timeZone: TIMEZONE },
    }

    if (existingId) {
      await calendar.events.update({ calendarId: CALENDAR_ID, eventId: existingId, requestBody }).catch(async (err) => {
        // L'évènement a pu être supprimé côté Google : on le recrée.
        if (err?.code === 404 || err?.response?.status === 404) {
          const created = await calendar.events.insert({ calendarId: CALENDAR_ID, requestBody })
          if (created.data.id) eventIds[type] = created.data.id
        }
      })
    } else {
      const created = await calendar.events.insert({ calendarId: CALENDAR_ID, requestBody })
      if (created.data.id) eventIds[type] = created.data.id
    }
  }

  return eventIds
}

async function supprimerEvenementsCalendrier(eventIds: GoogleEventIds) {
  const calendar = getCalendarClient()
  if (!calendar) return
  for (const eventId of Object.values(eventIds)) {
    if (eventId) await calendar.events.delete({ calendarId: CALENDAR_ID, eventId }).catch(() => {})
  }
}

const ENTETE_SHEET = [
  'N° Devis',
  'N° Client',
  'Client',
  'Job',
  'Statut',
  'Date',
  'RDV client',
  'Job (date)',
  'Pose ext.',
  'Pose int.',
  'Livraison',
  'Deadline',
  'Commentaire',
]

async function resyncSheet() {
  const sheets = getSheetsClient()
  const admin = getSupabaseAdmin()
  if (!sheets || !SHEET_ID || !admin) return

  const { data: rows } = await admin.from('dossiers').select('*').order('date', { ascending: true })
  const lignes = (rows ?? []).map((r) => {
    const d = rowToDossier(r as DossierRow)
    return [
      d.reference,
      d.numeroClient,
      d.client,
      d.job,
      STATUT_LABEL[d.statut],
      d.date,
      d.rdv ? `${d.rdv.date} ${d.rdv.heure}${d.rdv.lieu ? ' — ' + d.rdv.lieu : ''}` : '',
      d.dateImpression ?? '',
      d.poseExt ?? '',
      d.poseInt ?? '',
      d.dateLivraison ?? '',
      d.deadline ?? '',
      d.commentaire,
    ]
  })

  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: 'Dossiers!A1:Z10000' })
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Dossiers!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [ENTETE_SHEET, ...lignes] },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
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

  const { id, action } = (req.body ?? {}) as { id?: string; action?: 'upsert' | 'delete' }
  if (!id || (action !== 'upsert' && action !== 'delete')) {
    res.status(400).json({ error: 'id et action requis' })
    return
  }

  try {
    if (action === 'delete') {
      const { data: row } = await admin.from('dossiers').select('*').eq('id', id).maybeSingle()
      if (row) await supprimerEvenementsCalendrier((row as DossierRow).google_event_ids ?? {})
    } else {
      const { data: row } = await admin.from('dossiers').select('*').eq('id', id).maybeSingle()
      if (row) {
        const eventIds = await syncCalendrier(row as DossierRow)
        if (eventIds) await admin.from('dossiers').update({ google_event_ids: eventIds }).eq('id', id)
      }
    }
    await resyncSheet()
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('sync error', err)
    res.status(500).json({ error: 'sync failed' })
  }
}
