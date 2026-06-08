'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { CARDS, RARITY_STYLE, deriveStats, cardProgress } from '@/lib/cards'
import type { GymCard, Rarity } from '@/types'
import { TiltCard } from '@/components/ui/tilt-card'
import { CardFrame } from '@/components/ui/CardFrame'

type Filter = 'all' | 'legendary' | 'epic' | 'rare'

const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Toutes'      },
  { key: 'legendary', label: 'Légendaires' },
  { key: 'epic',      label: 'Épiques'     },
  { key: 'rare',      label: 'Rares'       },
]

const RANK: Record<Rarity, number> = { legendary: 3, epic: 2, rare: 1 }

export default function CardsScreen() {
  const { unlockedCards, sessions } = useApp()
  const [selected, setSelected] = useState<GymCard | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => deriveStats(sessions), [sessions])
  const progressFor = useMemo(() => {
    const map = new Map<string, ReturnType<typeof cardProgress>>()
    for (const c of CARDS) map.set(c.id, cardProgress(c, stats))
    return map
  }, [stats])

  const unlockedCount = CARDS.filter(c => unlockedCards.has(c.id)).length
  const pct = Math.round((unlockedCount / CARDS.length) * 100)

  // Featured = rarest unlocked card
  const featured = useMemo(() => {
    const u = CARDS.filter(c => unlockedCards.has(c.id))
    return u.sort((a, b) => RANK[b.rarity] - RANK[a.rarity])[0] ?? null
  }, [unlockedCards])

  // Closest locked card to completion — the "next goal"
  const nextGoal = useMemo(() => {
    return CARDS
      .filter(c => !unlockedCards.has(c.id))
      .map(c => ({ c, p: progressFor.get(c.id)! }))
      .sort((a, b) => b.p.pct - a.p.pct)[0] ?? null
  }, [unlockedCards, progressFor])

  // Ordered list: unlocked (rarest first) then locked (closest first)
  const ordered = useMemo(() => {
    const unlocked = CARDS.filter(c => unlockedCards.has(c.id)).sort((a, b) => RANK[b.rarity] - RANK[a.rarity])
    const locked = CARDS.filter(c => !unlockedCards.has(c.id))
      .sort((a, b) => progressFor.get(b.id)!.pct - progressFor.get(a.id)!.pct)
    return [...unlocked, ...locked]
  }, [unlockedCards, progressFor])

  const filtered = useMemo(
    () => (filter === 'all' ? ordered : ordered.filter(c => c.rarity === filter)),
    [ordered, filter],
  )

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-5 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Ma collection
          </p>
          <span className="text-xs text-zinc-600 font-mono">{unlockedCount}/{CARDS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#6D28D9,#A78BFA)', boxShadow: '0 0 8px rgba(139,92,246,0.5)' }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[10px] text-zinc-600">{pct}% complétée</span>
            {nextGoal && (
              <span className="text-[10px] text-zinc-600">
                Prochaine : {nextGoal.c.name} · {nextGoal.p.pct}%
              </span>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
          {FILTER_LABELS.map(({ key, label }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] font-semibold transition-all"
              style={filter === key
                ? { borderColor: '#A78BFA', background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }
                : { borderColor: 'rgba(255,255,255,0.06)', background: '#1C1C1C', color: '#737373' }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Featured card */}
        <AnimatePresence>
          {featured && filter === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5"
            >
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[1.4px] mb-2 flex items-center gap-1.5">
                <span className="w-[3px] h-[9px] rounded-full bg-amber-400/60 inline-block" />
                À l&apos;honneur
              </p>
              <FeaturedBanner card={featured} onClick={() => setSelected(featured)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((card, i) => {
            const locked = !unlockedCards.has(card.id)
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                whileHover={!locked ? { y: -4, scale: 1.02 } : undefined}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(card)}
                className="aspect-[3/4] text-left"
              >
                <CardFrame card={card} locked={locked} progress={progressFor.get(card.id)} />
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-60"
            >
              <TiltCard
                tiltLimit={14}
                scale={1.02}
                perspective={1000}
                spotlight
                holoIntensity={selected.rarity === 'legendary' ? 0.5 : selected.rarity === 'epic' ? 0.3 : 0.12}
                className="rounded-3xl"
              >
                <div className="w-full aspect-[2/3]">
                  <CardFrame
                    card={selected}
                    locked={!unlockedCards.has(selected.id)}
                    progress={progressFor.get(selected.id)}
                    size="lg"
                    className="rounded-3xl"
                  />
                </div>
              </TiltCard>
              <motion.button
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => setSelected(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#1C1C1C] border border-white/[0.06] text-sm font-medium text-zinc-300"
              >
                Retour
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FeaturedBanner({ card, onClick }: { card: GymCard; onClick: () => void }) {
  const r = RARITY_STYLE[card.rarity]
  const Icon = card.icon
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-full flex items-center gap-4 rounded-2xl overflow-hidden border-2 p-4 text-left"
      style={{ borderColor: r.clr, background: '#121212', boxShadow: `0 0 32px -8px ${r.glow}` }}
    >
      <div
        className="relative w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: r.grad }}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${r.glow}, transparent 65%)` }} />
        <Icon size={40} strokeWidth={1.6} className="relative z-10 text-white" style={{ filter: `drop-shadow(0 0 12px ${r.glow})` }} />
      </div>
      <div className="min-w-0">
        <span
          className="inline-block text-[9px] font-extrabold uppercase tracking-[0.6px] px-2 py-0.5 rounded-md text-white mb-1.5"
          style={{ background: r.clr, boxShadow: `0 0 10px ${r.glow}` }}
        >
          {r.lbl}
        </span>
        <div className="text-[15px] font-bold text-white tracking-tight leading-tight truncate">{card.name}</div>
        <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{card.cond}</div>
      </div>
    </motion.button>
  )
}
