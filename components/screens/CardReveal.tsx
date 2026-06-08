'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playReward } from '@/lib/audio'
import { RARITY_STYLE } from '@/lib/cards'
import { CardFrame } from '@/components/ui/CardFrame'

const FLY_IN = 350   // ms before the card flips
const FLIP_MS = 600  // flip duration

// Deterministic pseudo-random in [0,1) — keeps the sparkle layout stable & pure.
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

const labelVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function CardReveal() {
  const { revealQueue, dismissReveal } = useApp()
  const current = revealQueue[0] ?? null
  const remaining = Math.max(0, revealQueue.length - 1)

  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const rarity = current ? RARITY_STYLE[current.rarity] : RARITY_STYLE.rare

  // Drive the flip + reward feedback each time a new card reaches the front
  useEffect(() => {
    if (!current) return
    setFlipped(false)
    setRevealed(false)
    const t1 = setTimeout(() => setFlipped(true), FLY_IN)
    const t2 = setTimeout(() => {
      setRevealed(true)
      playReward(rarity.intensity)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(current.rarity === 'legendary' ? [0, 45, 50, 70] : current.rarity === 'epic' ? [0, 35, 40] : 30)
      }
    }, FLY_IN + FLIP_MS * 0.7)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [current, rarity.intensity])

  // Sparkle burst positions — deterministic (no Math.random during render)
  const sparkles = useMemo(
    () => Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + rnd(i) * 0.6
      const dist = 90 + rnd(i + 99) * 120
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, d: rnd(i + 7) * 0.25, s: 0.5 + rnd(i + 33) }
    }),
    [],
  )

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key="card-reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
          style={{ background: 'rgba(5,5,7,0.88)', backdropFilter: 'blur(20px)' }}
          onClick={dismissReveal}
        >
          {/* Rarity radial wash */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 42%, ${rarity.glow}, transparent 60%)` }}
          />

          {/* Rotating light rays */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: revealed ? 0.5 : 0, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6 },
              rotate: { duration: 24, ease: 'linear', repeat: Infinity },
            }}
            className="absolute pointer-events-none w-[520px] h-[520px] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${rarity.glow} 8deg, transparent 16deg, transparent 40deg, ${rarity.glow} 48deg, transparent 56deg, transparent 90deg, ${rarity.glow} 98deg, transparent 106deg, transparent 140deg, ${rarity.glow} 148deg, transparent 156deg, transparent 190deg, ${rarity.glow} 198deg, transparent 206deg, transparent 250deg, ${rarity.glow} 258deg, transparent 266deg, transparent 310deg, ${rarity.glow} 318deg, transparent 326deg)`,
              maskImage: 'radial-gradient(circle, transparent 26%, black 30%, black 60%, transparent 72%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 26%, black 30%, black 60%, transparent 72%)',
            }}
          />

          {/* Header label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={revealed ? 'done' : 'wait'}
              variants={labelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-[11px] font-bold uppercase tracking-[2.4px] mb-7 z-10"
              style={{ color: revealed ? rarity.clr : '#71717a' }}
            >
              {revealed ? 'Nouvelle carte débloquée' : 'Récompense en approche…'}
            </motion.p>
          </AnimatePresence>

          {/* Card with flip */}
          <div
            className="relative z-10"
            style={{ perspective: 1400 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sparkle burst */}
            <AnimatePresence>
              {revealed && sparkles.map((sp, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], x: sp.x, y: sp.y, scale: [0, sp.s, 0] }}
                  transition={{ duration: 0.9, delay: sp.d, ease: 'easeOut' }}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: rarity.clr, boxShadow: `0 0 8px ${rarity.clr}` }}
                />
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 0 : 180, scale: revealed ? [1, 1.04, 1] : 1 }}
                transition={{
                  rotateY: { duration: FLIP_MS / 1000, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.4, delay: 0.1 },
                }}
                className="relative w-[244px] aspect-[2/3]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front face — the actual card */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <CardFrame card={current} size="lg" className="rounded-3xl" />
                </div>

                {/* Back face — branded card back */}
                <div
                  className="absolute inset-0 rounded-3xl overflow-hidden border-2 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: 'rgba(139,92,246,0.4)',
                    background: 'linear-gradient(150deg,#1a1030,#0c0817 55%,#12091f)',
                    boxShadow: '0 0 40px -10px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)', boxShadow: '0 0 24px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.25)' }}
                  >
                    <Sparkles size={30} strokeWidth={1.8} className="text-white" />
                  </div>
                  <div className="text-xl font-semibold tracking-tight text-white">
                    Gym<span className="text-[#A78BFA]">Log</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-zinc-500 mt-1">Collection</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Continue button */}
          <AnimatePresence>
            {revealed && (
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                whileTap={{ scale: 0.96 }}
                onClick={e => { e.stopPropagation(); dismissReveal() }}
                className="mt-10 z-10 px-8 py-3.5 rounded-2xl font-semibold text-[15px] text-white"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -6px rgba(109,40,217,0.5)' }}
              >
                {remaining > 0 ? `Suivante (${remaining})` : 'Génial !'}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
