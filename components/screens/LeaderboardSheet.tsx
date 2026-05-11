'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Trophy, Flame, Dumbbell } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { createClient } from '@/lib/supabase/client'

interface Entry {
  userId: string
  name: string
  volume: number
  sessions: number
  streak: number
}

interface LeaderboardData {
  byVolume: Entry[]
  bySessions: Entry[]
  byStreak: Entry[]
}

type Metric = 'volume' | 'sessions' | 'streak'

const METRICS: { key: Metric; label: string; icon: typeof Trophy; fmt: (e: Entry) => string }[] = [
  { key: 'volume', label: 'Volume', icon: Trophy, fmt: e => e.volume >= 1000 ? `${(e.volume / 1000).toFixed(1)}T` : `${e.volume}kg` },
  { key: 'sessions', label: 'Séances', icon: Dumbbell, fmt: e => `${e.sessions}` },
  { key: 'streak', label: 'Streak', icon: Flame, fmt: e => `${e.streak}j` },
]

const MEDAL = ['🥇', '🥈', '🥉']

const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

interface Props {
  onClose: () => void
}

export default function LeaderboardSheet({ onClose }: Props) {
  const { user } = useApp()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<Metric>('volume')
  const [optedIn, setOptedIn] = useState<boolean>(
    user?.user_metadata?.leaderboard_opt_in === true
  )
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function toggleOptIn() {
    if (!user || toggling) return
    setToggling(true)
    const next = !optedIn
    const sb = createClient()
    await sb.auth.updateUser({ data: { leaderboard_opt_in: next } })
    setOptedIn(next)
    setToggling(false)
    // Refresh leaderboard after opt-in change
    if (next) {
      setLoading(true)
      fetch('/api/leaderboard')
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }

  const currentMetric = METRICS.find(m => m.key === metric)!
  const entries: Entry[] = data
    ? metric === 'volume' ? data.byVolume
      : metric === 'sessions' ? data.bySessions
      : data.byStreak
    : []

  const myRank = user ? entries.findIndex(e => e.userId === user.id) : -1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col rounded-t-[28px]"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: '0 -32px 80px -8px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
        }}
        data-no-swipe
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-4 flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[17px] font-semibold text-white tracking-tight">Classement</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{entries.length} athlète{entries.length > 1 ? 's' : ''} au classement</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center active:bg-white/10 transition-colors"
          >
            <X size={18} strokeWidth={1.8} className="text-zinc-400" />
          </button>
        </div>

        {/* Metric tabs */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="flex gap-1 p-1 rounded-2xl bg-[#0F0F0F] border border-white/[0.06]">
            {METRICS.map(m => {
              const Icon = m.icon
              const active = metric === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className="flex-1 h-10 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={active
                    ? { background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 4px 16px -4px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)', color: 'white' }
                    : { color: '#71717a' }}
                >
                  <Icon size={12} strokeWidth={1.8} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          {loading ? (
            <div className="flex flex-col gap-2 pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4 border"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.05))', borderColor: 'rgba(139,92,246,0.18)' }}
              >
                <Trophy size={28} strokeWidth={1.8} className="text-[#A78BFA]" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-2">Classement vide</h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-[220px]">
                Sois le premier à activer le classement public ci-dessous.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 pt-2">
              {entries.slice(0, 20).map((entry, i) => {
                const isMe = entry.userId === user?.id
                const isTop3 = i < 3
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 px-3 rounded-2xl"
                    style={{
                      minHeight: 56,
                      background: isMe
                        ? 'linear-gradient(135deg,rgba(109,40,217,0.18),rgba(139,92,246,0.1))'
                        : i === 0
                          ? 'rgba(241,196,15,0.05)'
                          : 'rgba(255,255,255,0.025)',
                      border: isMe
                        ? '1px solid rgba(139,92,246,0.3)'
                        : i === 0
                          ? '1px solid rgba(241,196,15,0.15)'
                          : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      {isTop3
                        ? <span className="text-[18px]">{MEDAL[i]}</span>
                        : <span className="text-[13px] font-bold font-mono text-zinc-600">#{i + 1}</span>
                      }
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                      style={isMe
                        ? { background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', color: 'white' }
                        : { background: 'rgba(255,255,255,0.07)', color: '#a1a1aa' }}
                    >
                      {entry.name[0].toUpperCase()}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: isMe ? '#C4B5FD' : '#e4e4e7' }}>
                        {entry.name}{isMe && <span className="text-[10px] text-zinc-500 ml-1.5 font-normal">· toi</span>}
                      </p>
                    </div>

                    {/* Stat */}
                    <div className="flex-shrink-0 text-right">
                      <span
                        className="text-[15px] font-bold font-mono"
                        style={{ color: i === 0 ? '#F1C40F' : isMe ? '#A78BFA' : '#a1a1aa' }}
                      >
                        {currentMetric.fmt(entry)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}

              {/* Current user if outside top 20 */}
              {myRank >= 20 && user && (
                <>
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[11px] text-zinc-600">···</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 rounded-2xl"
                    style={{
                      minHeight: 56,
                      background: 'linear-gradient(135deg,rgba(109,40,217,0.18),rgba(139,92,246,0.1))',
                      border: '1px solid rgba(139,92,246,0.3)',
                    }}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-[13px] font-bold font-mono text-zinc-500">#{myRank + 1}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', color: 'white' }}>
                      {entries[myRank].name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-violet-300">
                        {entries[myRank].name}<span className="text-[10px] text-zinc-500 ml-1.5 font-normal">· toi</span>
                      </p>
                    </div>
                    <span className="text-[15px] font-bold font-mono text-[#A78BFA]">
                      {currentMetric.fmt(entries[myRank])}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Opt-in footer */}
        <div
          className="flex-shrink-0 mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-200">Apparaître dans le classement</p>
            <p className="text-[12px] text-zinc-500 mt-0.5">Ton pseudo et tes stats seront visibles</p>
          </div>
          <button
            onClick={toggleOptIn}
            disabled={toggling}
            aria-label="Activer ou désactiver le classement public"
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-60"
            style={{ background: optedIn ? '#7C3AED' : 'rgba(255,255,255,0.12)' }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: optedIn ? 'translateX(21px)' : 'translateX(4px)' }}
            />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
