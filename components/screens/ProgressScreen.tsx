'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { BarChart2, TrendingUp } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Session } from '@/types'

const stagger: Variants = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

// ── Charts ────────────────────────────────────────────────────────

function ExoProgressChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="h-20 flex items-center justify-center text-xs text-zinc-600">
        {data.length === 0 ? 'Aucune donnée' : 'Fais encore une séance pour voir la courbe'}
      </div>
    )
  }

  const W = 300
  const H = 80
  const PX = 4
  const PY = 14

  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 5

  const pts = data.map((d, i) => ({
    x: +(PX + (i / (data.length - 1)) * (W - 2 * PX)).toFixed(1),
    y: +(PY + (1 - (d.weight - minW) / range) * (H - 2 * PY)).toFixed(1),
    weight: d.weight,
    date: d.date,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#chartGrad)" />
      <path d={linePath} stroke="#A78BFA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 2.5} fill="#A78BFA" opacity={i === pts.length - 1 ? 1 : 0.55} />
      ))}
      <text x={last.x} y={last.y - 7} textAnchor="middle" fill="#A78BFA" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {last.weight}kg
      </text>
    </svg>
  )
}

function WeeklyVolumeChart({ sessions }: { sessions: Session[] }) {
  const weeks = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const offset = 7 - i
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - offset * 7)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      const vol = sessions
        .filter(s => {
          const d = new Date(s.date + 'T12:00:00')
          return d >= start && d <= end
        })
        .reduce((acc, s) => acc + s.exos.reduce((a, e) =>
          a + e.sets.reduce((x, st) => x + (st.weight || 0) * (st.reps || 0), 0), 0), 0)

      return { label: offset === 0 ? 'Sem.' : `-${offset}s`, vol }
    })
  }, [sessions])

  const maxVol = Math.max(...weeks.map(w => w.vol)) || 1

  return (
    <div className="flex items-end gap-1.5" style={{ height: 72 }}>
      {weeks.map((w, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-[4px] transition-all duration-700"
            style={{
              height: `${Math.max(w.vol > 0 ? 6 : 2, (w.vol / maxVol) * 52)}px`,
              background: w.vol > 0
                ? 'linear-gradient(180deg,#A78BFA 0%,#6D28D9 100%)'
                : 'rgba(255,255,255,0.05)',
              boxShadow: w.vol > 0 ? '0 0 8px rgba(139,92,246,0.3)' : 'none',
            }}
          />
          <span className="text-[8px] text-zinc-600 font-mono">{w.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Screen ───────────────────────────────────────────────────

export default function ProgressScreen() {
  const { sessions } = useApp()
  const [selectedExo, setSelectedExo] = useState<string | null>(null)

  if (!sessions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
      >
        <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border"
          style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(139,92,246,0.06))', borderColor: 'rgba(139,92,246,0.2)', boxShadow: '0 0 40px -12px rgba(139,92,246,0.4)' }}>
          <BarChart2 size={36} className="text-[#A78BFA]" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Aucun progrès encore</h3>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">
          Enregistre ta première séance avec des poids pour voir tes records et ton volume ici.
        </p>
      </motion.div>
    )
  }

  // Build PRs map
  const map: Record<string, number> = {}
  sessions.forEach(s => (s.exos || []).forEach(e => {
    const w = Math.max(0, ...e.sets.map(st => st.weight || 0))
    if (w > 0 && (!map[e.name] || w > map[e.name])) map[e.name] = w
  }))
  const top = Object.entries(map).sort((a, b) => b[1] - a[1])
  const mx = top[0]?.[1] || 1

  // Stat cards
  const totalVol = sessions.reduce((acc, s) =>
    acc + s.exos.reduce((a, e) =>
      a + e.sets.reduce((x, st) => x + (st.weight || 0) * (st.reps || 0), 0), 0), 0)

  const statCards = [
    { val: sessions.length, lbl: 'Séances totales' },
    { val: `${[...new Set(sessions.map(s => s.type))].length}/5`, lbl: 'Groupes entraînés' },
    { val: top[0] ? `${top[0][1]}kg` : '—', lbl: top[0]?.[0] || 'Meilleur record' },
    { val: `${Math.round(totalVol / 1000)}T`, lbl: 'Volume total soulevé' },
  ]

  // Exercise list for selector (exercises with weight history)
  const exoNames = [...new Set(
    sessions.flatMap(s => s.exos
      .filter(e => e.sets.some(st => (st.weight || 0) > 0))
      .map(e => e.name)
    )
  )]

  const activeExo = selectedExo || (exoNames[0] ?? null)

  // Progression data for selected exercise
  const progression = useMemo(() => {
    if (!activeExo) return []
    return sessions
      .filter(s => s.exos.some(e => e.name === activeExo))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => {
        const exo = s.exos.find(e => e.name === activeExo)!
        const maxW = Math.max(0, ...exo.sets.map(st => st.weight || 0))
        return { date: s.date, weight: maxW }
      })
      .filter(d => d.weight > 0)
  }, [sessions, activeExo])

  const progressionDelta = progression.length >= 2
    ? +(progression[progression.length - 1].weight - progression[0].weight).toFixed(1)
    : null

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="px-4 pt-5 pb-28 flex flex-col gap-5"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ val, lbl }) => (
          <motion.div
            key={lbl}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            className="card-glass rounded-[18px] p-4 relative overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
          >
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />
            <div className="text-2xl font-bold font-mono text-white tracking-tight leading-none mb-1.5">{val}</div>
            <div className="text-[11px] text-zinc-500 tracking-wide">{lbl}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly volume */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          Volume hebdomadaire
        </p>
        <div className="card-glass rounded-2xl p-4">
          <WeeklyVolumeChart sessions={sessions} />
        </div>
      </motion.div>

      {/* Exercise progression chart */}
      {exoNames.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
              <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
              Progression
            </p>
            {progressionDelta !== null && (
              <span className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${progressionDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendingUp size={12} strokeWidth={2} />
                {progressionDelta >= 0 ? '+' : ''}{progressionDelta}kg
              </span>
            )}
          </div>

          {/* Exercise selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {exoNames.map(name => (
              <motion.button
                key={name}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedExo(name)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all"
                style={name === activeExo
                  ? { borderColor: '#A78BFA', background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }
                  : { borderColor: 'rgba(255,255,255,0.06)', background: '#1C1C1C', color: '#737373' }}
              >
                {name}
              </motion.button>
            ))}
          </div>

          <div className="card-glass rounded-2xl p-4">
            <ExoProgressChart data={progression} />
          </div>
        </motion.div>
      )}

      {/* Records */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          Records ({top.length})
        </p>
        <div className="card-glass rounded-2xl p-4">
          {top.slice(0, 10).map(([name, w], i) => (
            <div key={name} className="py-2.5 border-b border-white/[0.04] last:border-none">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-zinc-300 tracking-tight truncate mr-2">{name}</span>
                <span className="text-sm font-semibold font-mono text-[#A78BFA] flex-shrink-0">{w}kg</span>
              </div>
              <div className="h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(w / mx * 100)}%` }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ background: 'linear-gradient(90deg,#6D28D9,#A78BFA)', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%] animate-[shimmer_2.5s_linear_infinite]" />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
