import { createAdminClient } from '@/lib/supabase/admin'

// Rate limiter à deux niveaux :
// 1. `rateLimitPersistent` (recommandé) — compteur partagé dans Supabase via la
//    fonction SQL `consume_rate_limit` (voir scripts/rate-limits.sql). Survit
//    aux cold starts et est partagé entre toutes les instances serverless.
// 2. `rateLimit` (fallback) — compteur in-memory par instance. Utilisé
//    automatiquement si Supabase est indisponible (env manquante en local,
//    migration non exécutée, erreur réseau) : on ne bloque jamais une requête
//    légitime à cause d'un échec d'infrastructure.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfter: number // seconds until the window resets
}

export function rateLimit(
  key: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSec * 1000

  // Purge opportuniste : évite que la Map grossisse indéfiniment
  // (une entrée par utilisateur, jamais nettoyée sinon).
  if (buckets.size > 1000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 }
}

interface ConsumeRateLimitRow {
  ok: boolean
  remaining: number
  retry_after: number
}

export async function rateLimitPersistent(
  key: string,
  opts: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: key,
      p_limit: opts.limit,
      p_window_sec: opts.windowSec,
    })
    if (error) throw error
    const row = (Array.isArray(data) ? data[0] : data) as ConsumeRateLimitRow | undefined
    if (!row || typeof row.ok !== 'boolean') throw new Error('Réponse RPC inattendue')
    return { ok: row.ok, remaining: row.remaining, retryAfter: row.retry_after }
  } catch {
    // Supabase indisponible ou migration non exécutée → fallback in-memory.
    return rateLimit(key, opts)
  }
}
