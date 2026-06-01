import { describe, it, expect } from 'vitest'
import { computeStreak, exosVolume, personalBests, bestForExercise, type ExoLike } from '@/lib/stats'

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
