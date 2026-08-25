import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Tant que le projet Supabase n'est pas configuré (variables d'env absentes), l'app continue
// de fonctionner en localStorage seul — voir useDossiers/useMembres.
export const supabaseConfigured = Boolean(url && anonKey)

export const supabase = supabaseConfigured ? createClient(url, anonKey) : null
