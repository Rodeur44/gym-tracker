import { describe, expect, it, vi } from 'vitest'

// `server-only` jette une erreur hors React Server Components — neutralisé pour le test.
vi.mock('server-only', () => ({}))

const { validatePromo, PROMO_CODES } = await import('@/lib/promo')

describe('validatePromo', () => {
  it('accepte chaque code de la liste', () => {
    for (const code of PROMO_CODES) {
      expect(validatePromo(code)).toBe(true)
    }
  })

  it('est insensible à la casse', () => {
    expect(validatePromo('gymbros')).toBe(true)
    expect(validatePromo('GyMbRoS')).toBe(true)
  })

  it('tolère les espaces autour du code', () => {
    expect(validatePromo('  AMIS  ')).toBe(true)
    expect(validatePromo('\tENZO\n')).toBe(true)
  })

  it('rejette les codes inconnus', () => {
    expect(validatePromo('HACKER')).toBe(false)
    expect(validatePromo('')).toBe(false)
    expect(validatePromo('GYMBROS2')).toBe(false)
  })

  it('ne fait pas de correspondance partielle', () => {
    expect(validatePromo('GYM')).toBe(false)
    expect(validatePromo('BETA')).toBe(false)
  })
})
