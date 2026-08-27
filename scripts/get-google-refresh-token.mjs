#!/usr/bin/env node
// Script à lancer UNE SEULE FOIS, en local, pour obtenir le refresh token Google du compte
// crm.flashimpression@gmail.com. Voir SETUP.md pour le contexte complet.
//
// Usage :
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-refresh-token.mjs
//
// 1. Ouvre l'URL affichée dans un navigateur EN ÉTANT CONNECTÉ à crm.flashimpression@gmail.com.
// 2. Accepte les autorisations demandées (Agenda, Sheets, envoi d'email).
// 3. Le script récupère automatiquement le refresh token et l'affiche dans le terminal.
// 4. Copie ce refresh token dans GOOGLE_REFRESH_TOKEN (Vercel + .env.local).

import { createServer } from 'node:http'
import { google } from 'googleapis'

const PORT = 53682
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`

const clientId = process.argv[2] || process.env.GOOGLE_CLIENT_ID
const clientSecret = process.argv[3] || process.env.GOOGLE_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error(
    'Manque GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.\n' +
      'Usage : GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-refresh-token.mjs',
  )
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
  // drive.file : accès limité aux fichiers créés par l'app elle-même (pièces jointes),
  // pas à tout le Drive du compte.
  'https://www.googleapis.com/auth/drive.file',
]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // force le renvoi d'un refresh_token même si déjà autorisé avant
  scope: SCOPES,
})

console.log('\nOuvre cette URL dans un navigateur, connecté à crm.flashimpression@gmail.com :\n')
console.log(authUrl)
console.log(`\nEn attente de la redirection sur ${REDIRECT_URI} …\n`)

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) {
    res.writeHead(404)
    res.end()
    return
  }

  const code = new URL(req.url, REDIRECT_URI).searchParams.get('code')
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end("Pas de code reçu — as-tu bien accepté les autorisations ?")
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('OK, tu peux fermer cet onglet et revenir au terminal.')

    console.log('\n✅ Refresh token obtenu :\n')
    console.log(tokens.refresh_token ?? '(absent — relance le script, le prompt=consent aurait dû le forcer)')
    console.log('\nColle cette valeur dans GOOGLE_REFRESH_TOKEN (Vercel + .env.local).\n')
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end("Erreur lors de l'échange du code — voir le terminal.")
    console.error(err)
  } finally {
    server.close()
  }
})

server.listen(PORT)
