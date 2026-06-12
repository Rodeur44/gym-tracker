import { describe, it, expect } from 'vitest'
import { computeStreak, exosVolume, personalBests, bestForExercise, sessionMuscleGroups, lastPerformance, suggestNextTarget, type ExoLike } from '@/lib/stats'

// Fixed reference date so streak tests are deterministic.
const NOW = new Date('2026-06-01T12:00:00.000Z')
const day = (offset: number) => {
  const d = new Date(NOW)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

describe('computeStreak', () => {
  it('returns 0 with no dates', () => {
    expect(computeStreak([], NOW)).toBe(0)
  })

  it('counts a streak ending today', () => {
    expect(computeStreak([day(0), day(-1), day(-2)], NOW)).toBe(3)
  })

  it('tolerates not having trained today yet (streak ends yesterday)', () => {
    expect(computeStreak([day(-1), day(-2)], NOW)).toBe(2)
  })

  it('breaks on a gap', () => {
    expect(computeStreak([day(0), day(-1), day(-3)], NOW)).toBe(2)
  })

  it('returns 0 when the most recent session is older than yesterday', () => {
    expect(computeStreak([day(-2), day(-3)], NOW)).toBe(0)
  })

  it('deduplicates multiple sessions on the same day', () => {
    expect(computeStreak([day(0), day(0), day(-1)], NOW)).toBe(2)
  })

  it('accepts a Set as well as an array', () => {
    expect(computeStreak(new Set([day(0), day(-1)]), NOW)).toBe(2)
  })
})

describe('exosVolume', () => {
  it('sums weight × reps across all sets', () => {
    const exos: ExoLike[] = [
      { name: 'Squat', sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }] },
      { name: 'Curl', sets: [{ weight: 20, reps: 10 }] },
    ]
    expect(exosVolume(exos)).toBe(100 * 5 + 100 * 5 + 20 * 10)
  })

  it('treats bodyweight (missing/0 weight) as 0 volume', () => {
    expect(exosVolume([{ name: 'Pompes', sets: [{ reps: 20 }, { weight: 0, reps: 15 }] }])).toBe(0)
  })

  it('handles null weight/reps', () => {
    expect(exosVolume([{ sets: [{ weight: null, reps: null }] }])).toBe(0)
  })

  it('returns 0 for no exercises', () => {
    expect(exosVolume([])).toBe(0)
  })
})

describe('personalBests', () => {
  it('keeps the heaviest weight per exercise name', () => {
    const sessions = [
      { exos: [{ name: 'Bench', sets: [{ weight: 60, reps: 8 }, { weight: 70, reps: 5 }] }] },
      { exos: [{ name: 'Bench', sets: [{ weight: 65, reps: 6 }] }, { name: 'Squat', sets: [{ weight: 120, reps: 3 }] }] },
    ]
    expect(personalBests(sessions)).toEqual({ Bench: 70, Squat: 120 })
  })

  it('omits exercises that only have bodyweight sets', () => {
    expect(personalBests([{ exos: [{ name: 'Tractions', sets: [{ weight: 0, reps: 12 }] }] }])).toEqual({})
  })
})

describe('bestForExercise', () => {
  const sessions = [
    { exos: [{ name: 'Deadlift', sets: [{ weight: 140, reps: 3 }, { weight: 150, reps: 1 }] }] },
    { exos: [{ name: 'Deadlift', sets: [{ weight: 145, reps: 2 }] }] },
  ]
  it('returns the all-time max for the named exercise', () => {
    expect(bestForExercise(sessions, 'Deadlift')).toBe(150)
  })
  it('returns 0 for an unknown exercise', () => {
    expect(bestForExercise(sessions, 'Snatch')).toBe(0)
  })
})

describe('sessionMuscleGroups', () => {
  it('liste les groupes distincts dans l\'ordre d\'apparition', () => {
    const s = { type: 'dos', exos: [
      { name: 'Tractions', type: 'dos', sets: [] },
      { name: 'Curl', type: 'bras', sets: [] },
      { name: 'Squat', type: 'jambes', sets: [] },
      { name: 'Rowing', type: 'dos', sets: [] },
    ] }
    expect(sessionMuscleGroups(s)).toEqual(['dos', 'bras', 'jambes'])
  })

  it('retombe sur le type de séance pour les anciennes données sans type par exo', () => {
    const s = { type: 'pec', exos: [{ name: 'Développé', sets: [] }] }
    expect(sessionMuscleGroups(s)).toEqual(['pec'])
  })
})

describe('lastPerformance', () => {
  const sessions = [
    { date: '2026-06-01', exos: [{ name: 'Bench', sets: [{ weight: 60, reps: 8 }, { weight: 65, reps: 5 }] }] },
    { date: '2026-06-10', exos: [{ name: 'Bench', sets: [{ weight: 70, reps: 6 }] }] },
    { date: '2026-06-05', exos: [{ name: 'Squat', sets: [{ weight: 100, reps: 5 }] }] },
  ]

  it('retourne la meilleure série de la séance la plus récente', () => {
    expect(lastPerformance(sessions, 'Bench')).toEqual({ weight: 70, reps: 6, date: '2026-06-10' })
  })

  it('insensible à la casse et aux espaces', () => {
    expect(lastPerformance(sessions, '  bench ')).toEqual({ weight: 70, reps: 6, date: '2026-06-10' })
  })

  it('null pour un exercice jamais fait', () => {
    expect(lastPerformance(sessions, 'Curl')).toBeNull()
  })
})

describe('suggestNextTarget', () => {
  it('≥8 reps → +2,5 kg, reps réduites (min 6)', () => {
    expect(suggestNextTarget({ weight: 60, reps: 8, date: '2026-06-10' })).toEqual({ weight: 62.5, reps: 6 })
    expect(suggestNextTarget({ weight: 60, reps: 12, date: '2026-06-10' })).toEqual({ weight: 62.5, reps: 10 })
  })

  it('<8 reps → même poids, +1 rep', () => {
    expect(suggestNextTarget({ weight: 80, reps: 5, date: '2026-06-10' })).toEqual({ weight: 80, reps: 6 })
  })

  it('poids du corps → +1 rep', () => {
    expect(suggestNextTarget({ weight: 0, reps: 15, date: '2026-06-10' })).toEqual({ weight: 0, reps: 16 })
  })
})
