'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { BarChart2, TrendingUp, Dumbbell, Ruler, Dumbbell as DumbbellIcon, Flame, Trophy, Grid3x3 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Session } from '@/types'
import MeasurementsTab from './MeasurementsTab'

type Tab = 'exos' | 'body'

const stagger: Variants = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

// ── Sparkline ─────────────────────────────────────────────────────

function Sparkline({ sessions }: { sessions: Session[] }) {
  const points = useMemo((): { x: number; y: number }[] => {
    const vols: number[] = Array.from({ length: 8 }, (_, i) => {
      const offset = 7 - i
      const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - offset * 7)
      const end = new Date(start); end.setDate(start.getDate() + 6)
      return sessions
        .filter(s => { const d = new Date(s.date + 'T12:00:00'); return d >= start && d <= end })
        .reduce((acc, s) => acc + s.exos.reduce((a, e) => a + e.sets.reduce((x, st) => x + (st.weight||0)*(st.reps||0), 0), 0), 0)
    })
    const max = Math.max(...vols, 1)
    const W = 120, H = 36, PX = 2, PY = 4
    return vols.map((v: number, i: number) => ({
      x: +(PX + (i / (vols.length - 1)) * (W - 2 * PX)).toFixed(1),
      y: +(PY + (1 - v / max) * (H - 2 * PY)).toFixed(1),
    }))
  }, [sessions])

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = `${linePath} L ${points[points.length-1].x} 36 L ${points[0].x} 36 Z`

  return (
    <svg viewBox="0 0 120 36" style={{ width: 120, height: 36 }} className="opacity-80">
      <defs>
        <linearGradient id="spk-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#spk-grad)" />
      <path d={linePath} stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Mini bar chart ────────────────────────────────────────────────

function MiniBar({ value, max, color = '#A78BFA' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? value / max : 0
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 16 }}>
      {[0.4, 0.6, 0.75, 0.9, 1].map((scale, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm transition-all"
          style={{
            height: `${Math.round(scale * 16)}px`,
            background: i / 4 <= pct ? color : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </div>
  )
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

  const W = 300, H = 80, PX = 4, PY = 14
  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 5

  const pts = data.map((d, i) => ({
    x: +(PX + (i / (data.length - 1)) * (W - 2 * PX)).toFixed(1),
    y: +(PY + (1 - (d.weight - minW) / range) * (H - 2 * PY)).toFixed(1),
    weight: d.weight,
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
      const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - offset * 7)
      const end = new Date(start); end.setDate(start.getDate() + 6)
      const vol = sessions
        .filter(s => { const d = new Date(s.date + 'T12:00:00'); return d >= start && d <= end })
        .reduce((acc, s) => acc + s.exos.reduce((a, e) => a + e.sets.reduce((x, st) => x + (st.weight||0)*(st.reps||0), 0), 0), 0)
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
              background: w.vol > 0 ? 'linear-gradient(180deg,#A78BFA 0%,#6D28D9 100%)' : 'rgba(255,255,255,0.05)',
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
  const [tab, setTab] = useState<Tab>('exos')

  const map: Record<string, number> = {}
  sessions.forEach(s => (s.exos || []).forEach(e => {
    const w = Math.max(0, ...e.sets.map(st => st.weight || 0))
    if (w > 0 && (!map[e.name] || w > map[e.name])) map[e.name] = w
  }))
  const top = Object.entries(map).sort((a, b) => b[1] - a[1])
  const mx = top[0]?.[1] || 1

  const totalVol = sessions.reduce((acc, s) =>
    acc + s.exos.reduce((a, e) =>
      a + e.sets.reduce((x, st) => x + (st.weight||0)*(st.reps||0), 0), 0), 0)

  // Previous month volume for delta
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthVol = sessions
    .filter(s => new Date(s.date + 'T12:00:00') >= monthStart)
    .reduce((acc, s) => acc + s.exos.reduce((a, e) => a + e.sets.reduce((x, st) => x + (st.weight||0)*(st.reps||0), 0), 0), 0)
  const prevMonthVol = sessions
    .filter(s => { const d = new Date(s.date + 'T12:00:00'); return d >= prevMonthStart && d < monthStart })
    .reduce((acc, s) => acc + s.exos.reduce((a, e) => a + e.sets.reduce((x, st) => x + (st.weight||0)*(st.reps||0), 0), 0), 0)
  const volDelta = thisMonthVol - prevMonthVol
  const volDeltaStr = volDelta >= 1000
    ? `${volDelta > 0 ? '+' : ''}${(volDelta / 1000).toFixed(1)}T`
    : `${volDelta > 0 ? '+' : ''}${Math.round(volDelta / 100) * 100}kg`

  const exoNames = [...new Set(
    sessions.flatMap(s => s.exos.filter(e => e.sets.some(st => (st.weight||0) > 0)).map(e => e.name))
  )]
  const activeExo = selectedExo || (exoNames[0] ?? null)

  const progression = useMemo(() => {
    if (!activeExo) return []
    return sessions
      .filter(s => s.exos.some(e => e.name === activeExo))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => {
        const exo = s.exos.find(e => e.name === activeExo)!
        return { date: s.date, weight: Math.max(0, ...exo.sets.map(st => st.weight||0)) }
      })
      .filter(d => d.weight > 0)
  }, [sessions, activeExo])

  const progressionDelta = progression.length >= 2
    ? +(progression[progression.length - 1].weight - progression[0].weight).toFixed(1)
    : null

  const groupsTrained = [...new Set(sessions.map(s => s.type))].length

  const tabsBar = (
    <div className="px-4 pt-4">
      <div className="flex gap-1 p-1 rounded-2xl bg-[#0F0F0F] border border-white/[0.06]">
        <button
          onClick={() => setTab('exos')}
          className={`flex-1 h-10 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${tab === 'exos' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          style={tab === 'exos' ? { background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 4px 16px -4px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)' } : undefined}
        >
          <Dumbbell size={13} strokeWidth={1.8} /> Exercices
        </button>
        <button
          onClick={() => setTab('body')}
          className={`flex-1 h-10 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${tab === 'body' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          style={tab === 'body' ? { background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 4px 16px -4px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)' } : undefined}
        >
          <Ruler size={13} strokeWidth={1.8} /> Mensurations
        </button>
      </div>
    </div>
  )

  if (tab === 'body') {
    return (
      <div className="pb-28">
        {tabsBar}
        <div className="px-4 pt-4"><MeasurementsTab /></div>
      </div>
    )
  }

  if (!sessions.length) {
    return (
      <div className="pb-28">
        {tabsBar}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
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
      </div>
    )
  }

  return (
    <div className="pb-28">
      {tabsBar}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="px-4 pt-4 flex flex-col gap-4"
      >

        {/* Hero volume card */}
        <motion.div
          variants={fadeUp}
          className="rounded-[22px] p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgba(109,40,217,0.25) 0%,rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 0 40px -12px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.5)] to-transparent" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-[1.8px] mb-2">Volume total</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[36px] font-bold font-mono text-white leading-none tracking-tight">
                  {totalVol >= 1000 ? (totalVol / 1000).toFixed(1) : Math.round(totalVol)}
                </span>
                <span className="text-[14px] font-semibold text-zinc-400">{totalVol >= 1000 ? 'tonnes' : 'kg'}</span>
              </div>
              {prevMonthVol > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1 ${volDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    <TrendingUp size={10} strokeWidth={2} />
                    {volDeltaStr}
                  </span>
                  <span className="text-[10px] text-zinc-600">vs. mois précédent</span>
                </div>
              )}
            </div>
            <Sparkline sessions={sessions} />
          </div>
        </motion.div>

        {/* 4 stat cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          {/* Séances */}
          <div className="card-glass rounded-[18px] p-4 relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <DumbbellIcon size={13} strokeWidth={1.8} className="text-[#A78BFA]" />
              </div>
              <MiniBar value={sessions.length} max={Math.max(sessions.length, 30)} />
            </div>
            <div className="text-[26px] font-bold font-mono text-white leading-none mb-1">{sessions.length}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Séances totales</div>
          </div>

          {/* Records */}
          <div className="card-glass rounded-[18px] p-4 relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Trophy size={13} strokeWidth={1.8} className="text-amber-400" />
              </div>
              <MiniBar value={top.length} max={Math.max(top.length, 10)} color="#FBBF24" />
            </div>
            <div className="text-[26px] font-bold font-mono text-white leading-none mb-1">{top.length}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Records établis</div>
          </div>

          {/* Top record */}
          <div className="card-glass rounded-[18px] p-4 relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Flame size={13} strokeWidth={1.8} className="text-[#A78BFA]" />
              </div>
            </div>
            <div className="text-[26px] font-bold font-mono text-white leading-none mb-1">
              {top[0] ? `${top[0][1]}kg` : '—'}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide truncate">{top[0]?.[0] || 'Meilleur record'}</div>
          </div>

          {/* Groupes */}
          <div className="card-glass rounded-[18px] p-4 relative overflow-hidden" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <Grid3x3 size={13} strokeWidth={1.8} className="text-emerald-400" />
              </div>
              <MiniBar value={groupsTrained} max={5} color="#34D399" />
            </div>
            <div className="text-[26px] font-bold font-mono text-white leading-none mb-1">{groupsTrained}<span className="text-[14px] text-zinc-600">/5</span></div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Groupes entraînés</div>
          </div>
        </motion.div>

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

        {/* Exercise progression */}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_linear_infinite]" style={{ transform: 'translateX(-100%)' }} />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
