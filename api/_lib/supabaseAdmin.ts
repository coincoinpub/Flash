// Client Supabase côté serveur (clé service_role : contourne les policies RLS, ne doit
// jamais être exposée au frontend). Utilisé par les fonctions serverless dans api/.
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey)
}
