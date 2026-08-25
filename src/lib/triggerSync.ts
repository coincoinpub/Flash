// Déclenche la synchro Google Calendar / Google Sheet (api/sync.ts) après une écriture
// Supabase. Best-effort : ne doit jamais faire échouer l'action principale de l'utilisateur.
export async function triggerSync(id: string, action: 'upsert' | 'delete') {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
  } catch {
    // Hors ligne, fonction serverless indisponible, ou Google pas encore configuré : tant pis,
    // la synchro se refera au prochain changement sur ce dossier.
  }
}
