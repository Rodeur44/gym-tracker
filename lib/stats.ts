// Pure, shared training-stats helpers used on both the client (AppContext) and
// the server (leaderboard / AI routes). Kept dependency-free and framework-free
// so the exact same numbers are computed everywhere — no silent divergence.

// Structural (minimal) shapes so callers can pass either full `Session`/
// `Exercise` objects or the trimmed rows fetched server-side.
export interface SetLike {
  weight?: number | null
  reps?: number | null
}
export interface ExoLike {
  name?: string
  sets: SetLike[]
  type?: string
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Groupes musculaires distincts d'une séance, dans l'ordre d'apparition.
 * Dérivé du type propre à chaque exercice ; retombe sur le type de séance
 * pour les anciennes données qui n'avaient pas de type par exercice.
 */
export function sessionMuscleGroups(
  session: { type?: string; exos: ExoLike[] },
): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const e of session.exos) {
    const t = e.type
    if (t && !seen.has(t)) { seen.add(t); ordered.push(t) }
  }
  if (ordered.length === 0 && session.type) return [session.type]
  return ordered
}

/**
 * Length of the current consecutive-day training streak.
 *
 * A streak is unbroken as long as there's a session today or yesterday, then
 * each preceding day. `now` is injectable for deterministic tests.
 */
export function computeStreak(dates: Iterable<string>, now: Date = new Date()): number {
  const set = dates instanceof Set ? dates : new Set(dates)
  let count = 0
  const d = new Date(now)
  // Tolerate "hasn't trained yet today": start counting from yesterday.
  if (!set.has(isoDay(d))) d.setDate(d.getDate() - 1)
  while (set.has(isoDay(d))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

/** Tonnage for a list of exercises: Σ (weight × reps). */
export function exosVolume(exos: ExoLike[]): number {
  return exos.reduce(
    (acc, e) => acc + e.sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0),
    0,
  )
}

/** Heaviest weight logged per exercise name across the given sessions. */
export function personalBests(sessions: { exos: ExoLike[] }[]): Record<string, number> {
  const bests: Record<string, number> = {}
  for (const s of sessions) {
    for (const e of s.exos) {
      if (!e.name) continue
      const max = e.sets.reduce((m, st) => Math.max(m, st.weight || 0), 0)
      if (max > 0 && (!bests[e.name] || max > bests[e.name])) bests[e.name] = max
    }
  }
  return bests
}

/** Heaviest weight ever logged for a single exercise name. */
export function bestForExercise(sessions: { exos: ExoLike[] }[], name: string): number {
  let best = 0
  for (const s of sessions) {
    for (const e of s.exos) {
      if (e.name !== name) continue
      for (const set of e.sets) if ((set.weight || 0) > best) best = set.weight || 0
    }
  }
  return best
}
