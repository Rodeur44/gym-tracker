import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

// Chaque test utilise une clé unique : l'état du limiteur est un Map au niveau
// module, partagé entre les tests d'un même fichier.
let n = 0
const freshKey = () => `test-${++n}`

describe('rateLimit (in-memory)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-13T00:00:00.000Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('autorise jusqu\'à la limite puis bloque', () => {
    const key = freshKey()
    const opts = { limit: 3, windowSec: 60 }
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 2, retryAfter: 0 })
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 1, retryAfter: 0 })
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 0, retryAfter: 0 })
    const blocked = rateLimit(key, opts)
    expect(blocked.ok).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfter).toBeGreaterThan(0)
  })

  it('retryAfter décompte les secondes restantes de la fenêtre', () => {
    const key = freshKey()
    const opts = { limit: 1, windowSec: 60 }
    rateLimit(key, opts)
    vi.advanceTimersByTime(45_000)
    expect(rateLimit(key, opts).retryAfter).toBe(15)
  })

  it('réinitialise le compteur après expiration de la fenêtre', () => {
    const key = freshKey()
    const opts = { limit: 1, windowSec: 60 }
    expect(rateLimit(key, opts).ok).toBe(true)
    expect(rateLimit(key, opts).ok).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(rateLimit(key, opts)).toEqual({ ok: true, remaining: 0, retryAfter: 0 })
  })

  it('isole les compteurs par clé', () => {
    const a = freshKey()
    const b = freshKey()
    const opts = { limit: 1, windowSec: 60 }
    expect(rateLimit(a, opts).ok).toBe(true)
    expect(rateLimit(a, opts).ok).toBe(false)
    expect(rateLimit(b, opts).ok).toBe(true)
  })
})
