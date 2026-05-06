import { createClient } from '@supabase/supabase-js'

// Server-only — never import this from a 'use client' file.
// Requires SUPABASE_SERVICE_ROLE_KEY (not the public anon key).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars missing.')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
