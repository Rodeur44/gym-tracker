import { describe, expect, it } from 'vitest'
import { CARDS, cardProgress, checkUnlocks, deriveStats } from '@/lib/cards'
import type { Exercise, MuscleGroup, Session } from '@/types'

let id = 0
function session(
  date: string,
  type: MuscleGroup,
  exos: Exercise[],
): Session {
  return { id: `s${++id}`, user_id: 'u1', date, type, notes: '', exos }
}

const exo = (name: string, sets: { weight: number; reps: number }[], type?: MuscleGroup): Exercise =>
  ({ name, sets, ...(type ? { type } : {}) })

describe('deriveStats', () => {
  it('calcule les métriques scalaires sur un jeu de séances', () => {
    const sessions = [
      session('2026-01-01', 'pec', [
        exo('Développé couché', [{ weight: 60, reps: 8 }, { weight: 70, reps: 5 }]),
        exo('Pompes', [{ weight: 0, reps: 20 }]),
      ]),
      session('2026-01-03', 'jambes', [
        exo('Squat', [{ weight: 100, reps: 5 }]),
      ]),
    ]
    const s = deriveStats(sessions)
    expect(s.total).toBe(2)
    expect(s.totalVolume).toBe(60 * 8 + 70 * 5 + 100 * 5)
    expect(s.totalReps).toBe(8 + 5 + 20 + 5)
    expect(s.distinctExercises).toBe(3)
    expect(s.maxWeight(['squat'])).toBe(100)
    expect(s.maxWeight(['bench', 'développé couché'])).toBe(70)
    expect(s.sessionsOfType('jambes')).toBe(1)
    expect(s.sessionsOfType('cardio')).toBe(0)
  })

  it('big three : compte les mouvements pratiqués et le total élite', () => {
    const sessions = [
      session('2026-01-01', 'jambes', [exo('Squat', [{ weight: 140, reps: 3 }])]),
      session('2026-01-02', 'pec', [exo('Développé couché', [{ weight: 100, reps: 2 }])]),
      session('2026-01-03', 'dos', [exo('Soulevé de terre', [{ weight: 180, reps: 1 }])]),
    ]
    const s = deriveStats(sessions)
    expect(s.bigThreeCount).toBe(3)
    expect(s.eliteTotal).toBe(140 + 100 + 180)
  })

  it('le type par exercice prime sur le type de séance (volumeByType)', () => {
    const sessions = [
      session('2026-01-01', 'pec', [
        exo('Développé couché', [{ weight: 50, reps: 10 }]),          // pec (hérité)
        exo('Curl', [{ weight: 20, reps: 10 }], 'bras'),               // bras (explicite)
      ]),
    ]
    const s = deriveStats(sessions)
    expect(s.volumeByType('pec')).toBe(500)
    expect(s.volumeByType('bras')).toBe(200)
  })

  it('maxRepsInSession : meilleur total sur une seule séance', () => {
    const sessions = [
      session('2026-01-01', 'dos', [exo('Tractions', [{ weight: 0, reps: 20 }, { weight: 0, reps: 15 }])]),
      session('2026-01-02', 'dos', [exo('Tractions lestées', [{ weight: 10, reps: 30 }])]),
    ]
    const s = deriveStats(sessions)
    expect(s.maxRepsInSession('traction')).toBe(35)
    expect(s.repsForKeyword('traction')).toBe(65)
  })

  it('retourne des métriques nulles sans séances', () => {
    const s = deriveStats([])
    expect(s.total).toBe(0)
    expect(s.totalVolume).toBe(0)
    expect(s.streak).toBe(0)
    expect(s.maxWeight(['squat'])).toBe(0)
    expect(s.bigThreeCount).toBe(0)
  })
})

describe('cardProgress', () => {
  const bench100 = CARDS.find(c => c.id === 'bench_100')!

  it('carte non débloquée : pct partiel et label formaté', () => {
    const stats = deriveStats([
      session('2026-01-01', 'pec', [exo('Développé couché', [{ weight: 80, reps: 5 }])]),
    ])
    const p = cardProgress(bench100, stats)
    expect(p.unlocked).toBe(false)
    expect(p.current).toBe(80)
    expect(p.pct).toBe(80)
    expect(p.label).toBe('80 / 100 kg')
  })

  it('carte débloquée : pct plafonné à 100', () => {
    const stats = deriveStats([
      session('2026-01-01', 'pec', [exo('Développé couché', [{ weight: 120, reps: 1 }])]),
    ])
    const p = cardProgress(bench100, stats)
    expect(p.unlocked).toBe(true)
    expect(p.pct).toBe(100)
  })

  it('formate le volume en tonnes', () => {
    const volChest = CARDS.find(c => c.id === 'vol_chest')!
    const stats = deriveStats([
      session('2026-01-01', 'pec', [exo('Développé couché', [{ weight: 100, reps: 100 }])]), // 10 000 kg
    ])
    expect(cardProgress(volChest, stats).label).toBe('10.0 / 50 T')
  })
})

describe('checkUnlocks', () => {
  const sessions = [
    session('2026-01-01', 'pec', [exo('Développé couché', [{ weight: 45, reps: 5 }])]),
  ]

  it('retourne les cartes nouvellement gagnées', () => {
    const unlocked = checkUnlocks(sessions, new Set())
    expect(unlocked).toContain('first_session') // 1 séance
    expect(unlocked).toContain('bench_40')      // 45 kg ≥ 40
    expect(unlocked).not.toContain('bench_60')  // 45 kg < 60
    expect(unlocked).not.toContain('sessions_10')
  })

  it('exclut les cartes déjà possédées', () => {
    const unlocked = checkUnlocks(sessions, new Set(['first_session']))
    expect(unlocked).not.toContain('first_session')
    expect(unlocked).toContain('bench_40')
  })

  it('aucune carte sans séances', () => {
    expect(checkUnlocks([], new Set())).toEqual([])
  })
})

describe('catalogue CARDS', () => {
  it('les IDs sont uniques (persistés en base)', () => {
    const ids = CARDS.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque carte a une cible strictement positive', () => {
    for (const c of CARDS) expect(c.target).toBeGreaterThan(0)
  })
})
