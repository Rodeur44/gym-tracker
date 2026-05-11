import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 15

interface ExoSet { weight?: number; reps?: number }
interface Exo { sets: ExoSet[] }

function computeVolume(exos: Exo[]): number {
  return exos.reduce((acc, e) =>
    acc + e.sets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0), 0)
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates)
  let count = 0
  const d = new Date()
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (set.has(d.toISOString().slice(0, 10))) {
    count++
    d.setDate(d.getDate() - 1)
  }
  return count
}

export async function GET() {
  const admin = createAdminClient()

  const [sessionsRes, usersRes] = await Promise.all([
    admin.from('sessions').select('user_id, date, exos'),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  if (sessionsRes.error || usersRes.error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const optedIn = new Set(
    usersRes.data.users
      .filter(u => u.user_metadata?.leaderboard_opt_in === true)
      .map(u => u.id)
  )

  const nameMap = Object.fromEntries(
    usersRes.data.users.map(u => [
      u.id,
      u.user_metadata?.display_name || u.email?.split('@')[0] || 'Athlète',
    ])
  )

  const stats: Record<string, { volume: number; sessions: number; dates: string[] }> = {}

  for (const row of sessionsRes.data ?? []) {
    if (!optedIn.has(row.user_id)) continue
    if (!stats[row.user_id]) stats[row.user_id] = { volume: 0, sessions: 0, dates: [] }
    stats[row.user_id].sessions++
    stats[row.user_id].volume += computeVolume(row.exos as Exo[])
    stats[row.user_id].dates.push(row.date)
  }

  const entries = Object.entries(stats).map(([userId, s]) => ({
    userId,
    name: nameMap[userId] || 'Athlète',
    volume: Math.round(s.volume),
    sessions: s.sessions,
    streak: computeStreak(s.dates),
  }))

  const byVolume = [...entries].sort((a, b) => b.volume - a.volume)
  const bySessions = [...entries].sort((a, b) => b.sessions - a.sessions)
  const byStreak = [...entries].sort((a, b) => b.streak - a.streak)

  return NextResponse.json(
    { byVolume, bySessions, byStreak },
    { headers: { 'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=600' } }
  )
}
