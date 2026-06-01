// Lightweight in-memory rate limiter (token-per-window) keyed by an arbitrary
// identifier (e.g. a user id). Best-effort only: state lives per serverless
// instance, so under heavy fan-out a determined caller could exceed the limit.
// It's enough to stop casual abuse; for hard guarantees back this with a shared
// store (Upstash Redis via the Vercel Marketplace).

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
