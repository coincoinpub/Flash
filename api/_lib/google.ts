// Authentification Google (compte crm.flashimpression@gmail.com) côté serveur, pour
// Calendar, Sheets et l'envoi d'emails (Gmail). Voir SETUP.md pour obtenir les identifiants
// (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN).
import { google } from 'googleapis'

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
}

export function getGoogleAuth() {
  if (!googleConfigured()) return null
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return auth
}

export function getCalendarClient() {
  const auth = getGoogleAuth()
  return auth ? google.calendar({ version: 'v3', auth }) : null
}

export function getSheetsClient() {
  const auth = getGoogleAuth()
  return auth ? google.sheets({ version: 'v4', auth }) : null
}

export function getGmailClient() {
  const auth = getGoogleAuth()
  return auth ? google.gmail({ version: 'v1', auth }) : null
}

export function getDriveClient() {
  const auth = getGoogleAuth()
  return auth ? google.drive({ version: 'v3', auth }) : null
}

// L'API Gmail attend un message MIME encodé en base64url. Construit un email HTML simple.
export function buildRawEmail(options: { from: string; to: string; subject: string; html: string }) {
  const { from, to, subject, html } = options
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n')
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
