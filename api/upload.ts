// Pièces jointes (logo, photo, devis, facture, BAT…) : upload vers le Google Drive du compte
// crm.flashimpression@gmail.com, référence stockée sur le dossier (colonne pieces_jointes).
//
// Envoyé en JSON base64 depuis le frontend (voir src/components/DossierDetail.tsx) plutôt qu'en
// multipart : plus simple côté fonction serverless, au prix d'environ +33% de taille — donc une
// limite pratique d'environ 3 Mo par fichier (limite par défaut du corps de requête Vercel).
import { Readable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { getDriveClient, googleConfigured } from './_lib/google.js'
import type { DossierRow } from '../src/lib/dossierRow.ts'
import type { PieceJointe } from '../src/types.ts'

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    res.status(501).json({ error: 'supabase non configuré (voir SETUP.md)' })
    return
  }
  if (!googleConfigured()) {
    res.status(501).json({ error: 'google non configuré (voir SETUP.md)' })
    return
  }
  const drive = getDriveClient()
  if (!drive) {
    res.status(501).json({ error: 'google drive indisponible' })
    return
  }

  if (req.method === 'POST') {
    const { dossierId, nom, mimeType, contenuBase64 } = (req.body ?? {}) as {
      dossierId?: string
      nom?: string
      mimeType?: string
      contenuBase64?: string
    }
    if (!dossierId || !nom || !mimeType || !contenuBase64) {
      res.status(400).json({ error: 'dossierId, nom, mimeType et contenuBase64 requis' })
      return
    }

    try {
      const { data: row } = await admin.from('dossiers').select('*').eq('id', dossierId).maybeSingle()
      if (!row) {
        res.status(404).json({ error: 'dossier introuvable' })
        return
      }

      const buffer = Buffer.from(contenuBase64, 'base64')
      const prefixe = (row as DossierRow).reference || (row as DossierRow).client || dossierId
      const created = await drive.files.create({
        requestBody: { name: `${prefixe} — ${nom}`, parents: DRIVE_FOLDER_ID ? [DRIVE_FOLDER_ID] : undefined },
        media: { mimeType, body: Readable.from(buffer) },
        fields: 'id, webViewLink',
      })
      if (!created.data.id) throw new Error('upload Drive sans id retourné')

      // Lien consultable par quiconque a le lien — cohérent avec le reste de l'app (pas de
      // compte utilisateur, lien Vercel non public).
      await drive.permissions.create({ fileId: created.data.id, requestBody: { role: 'reader', type: 'anyone' } })

      const piece: PieceJointe = {
        id: created.data.id,
        nom,
        url: created.data.webViewLink ?? `https://drive.google.com/file/d/${created.data.id}/view`,
        mimeType,
        taille: buffer.length,
        ajouteLe: new Date().toISOString().slice(0, 10),
      }

      const piecesJointes = [...((row as DossierRow).pieces_jointes ?? []), piece]
      await admin.from('dossiers').update({ pieces_jointes: piecesJointes }).eq('id', dossierId)

      res.status(200).json({ piece, piecesJointes })
    } catch (err) {
      console.error('upload error', err)
      res.status(500).json({ error: 'upload failed' })
    }
    return
  }

  if (req.method === 'DELETE') {
    const { dossierId, pieceId } = (req.body ?? {}) as { dossierId?: string; pieceId?: string }
    if (!dossierId || !pieceId) {
      res.status(400).json({ error: 'dossierId et pieceId requis' })
      return
    }
    try {
      const { data: row } = await admin.from('dossiers').select('*').eq('id', dossierId).maybeSingle()
      if (!row) {
        res.status(404).json({ error: 'dossier introuvable' })
        return
      }
      await drive.files.delete({ fileId: pieceId }).catch(() => {})
      const piecesJointes = ((row as DossierRow).pieces_jointes ?? []).filter((p) => p.id !== pieceId)
      await admin.from('dossiers').update({ pieces_jointes: piecesJointes }).eq('id', dossierId)
      res.status(200).json({ piecesJointes })
    } catch (err) {
      console.error('delete piece jointe error', err)
      res.status(500).json({ error: 'delete failed' })
    }
    return
  }

  res.status(405).json({ error: 'method not allowed' })
}
