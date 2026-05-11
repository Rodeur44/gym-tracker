import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CARDS, TYPE_LBL } from '@/lib/constants'
import type { MuscleGroup } from '@/types'

interface ExoSet { weight: number; reps: number }
interface Exo { name: string; sets: ExoSet[] }
interface Row { date: string; type: string; exos: Exo[] }

function computeStats(sessions: Row[]) {
  const totalVol = sessions.reduce((acc, s) =>
    acc + s.exos.reduce((a, e) =>
      a + e.sets.reduce((x, st) => x + (st.weight || 0) * (st.reps || 0), 0), 0), 0)

  const dates = new Set(sessions.map(s => s.date))
  let streak = 0
  const d = new Date()
  if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  const map: Record<string, number> = {}
  sessions.forEach(s => s.exos.forEach(e => {
    const w = Math.max(0, ...e.sets.map(st => st.weight || 0))
    if (w > 0 && (!map[e.name] || w > map[e.name])) map[e.name] = w
  }))
  const records = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const groups = [...new Set(sessions.map(s => s.type))] as MuscleGroup[]

  return { totalVol, streak, records, groups }
}

function fmt(vol: number) {
  return vol >= 1000 ? `${(vol / 1000).toFixed(1)}T` : `${Math.round(vol)}kg`
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params
  try {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.getUserById(userId)
    const name = data.user?.user_metadata?.display_name || 'Athlète'
    return {
      title: `${name} · GymLog`,
      description: `Découvre les stats de ${name} sur GymLog`,
    }
  } catch {
    return { title: 'GymLog' }
  }
}

export default async function SharePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const admin = createAdminClient()

  const [userRes, sessionsRes, cardsRes] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from('sessions').select('date, type, exos').eq('user_id', userId),
    admin.from('user_cards').select('card_id').eq('user_id', userId),
  ])

  if (userRes.error || !userRes.data.user) notFound()

  const displayName = userRes.data.user.user_metadata?.display_name || 'Athlète'
  const initials = displayName[0].toUpperCase()
  const sessions = (sessionsRes.data ?? []) as Row[]
  const unlockedCardIds = new Set((cardsRes.data ?? []).map(c => c.card_id))
  const { totalVol, streak, records, groups } = computeStats(sessions)

  const legendaryCount = CARDS.filter(c => c.rarity === 'legendary' && unlockedCardIds.has(c.id)).length

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      <div className="max-w-[430px] mx-auto px-4 pt-12 pb-16 flex flex-col gap-6">

        {/* Branding */}
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-white">
            Gym<span style={{ color: '#A78BFA', filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.6))' }}>Log</span>
          </p>
        </div>

        {/* Profile card */}
        <div
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#6D28D9 0%,#7C3AED 40%,#8B5CF6 100%)',
            boxShadow: '0 24px 60px -12px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-black/20 blur-2xl" />
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
              style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              {initials}
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{displayName}</h1>
            <p className="text-white/60 text-sm mt-1">{sessions.length} séances · {groups.map(g => TYPE_LBL[g]).join(', ')}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Séances', value: sessions.length.toString() },
            { label: 'Volume', value: fmt(totalVol) },
            { label: 'Streak', value: streak > 0 ? `${streak}j` : '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              <div className="text-2xl font-bold font-mono text-white">{value}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Records */}
        {records.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="px-4 pt-4 pb-2">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1.8px' }}>
                Records personnels
              </p>
            </div>
            {records.map(([name, w], i) => (
              <div
                key={name}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
              >
                <span style={{ fontSize: 14, color: '#d4d4d8', flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: '#A78BFA', flexShrink: 0 }}>{w}kg</span>
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {unlockedCardIds.size > 0 && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: 'linear-gradient(135deg,rgba(241,196,15,0.15),rgba(243,156,18,0.08))', border: '1px solid rgba(241,196,15,0.2)' }}
            >
              🃏
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', color: 'white', lineHeight: 1 }}>
                {unlockedCardIds.size}<span style={{ fontSize: 13, color: '#52525b', marginLeft: 2 }}>/{CARDS.length}</span>
              </div>
              <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 4 }}>
                Cartes débloquées{legendaryCount > 0 ? ` · ${legendaryCount} légendaire${legendaryCount > 1 ? 's' : ''}` : ''}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href="/"
          className="w-full flex items-center justify-center h-13 rounded-2xl text-sm font-semibold text-white"
          style={{
            height: 52,
            background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
            boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5)',
            textDecoration: 'none',
          }}
        >
          Rejoindre GymLog
        </a>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#3f3f46' }}>gymlog.app</p>
      </div>
    </div>
  )
}
