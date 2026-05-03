'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { CARDS } from '@/lib/constants'
import { TiltCard } from '@/components/ui/tilt-card'

const RARITY_LBL = { rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' }
const RARITY_CLR = {
  rare: { border: '#3498db', badge: 'bg-[#3498db]', glow: 'rgba(52,152,219,0.3)' },
  epic: { border: '#9b59b6', badge: 'bg-[#9b59b6]', glow: 'rgba(155,89,182,0.3)' },
  legendary: { border: '#f1c40f', badge: 'bg-gradient-to-r from-[#f1c40f] to-[#f39c12]', glow: 'rgba(241,196,15,0.35)' },
}

export default function CardsScreen() {
  const { unlockedCards } = useApp()
  const [selected, setSelected] = useState<typeof CARDS[0] | null>(null)
  const unlocked = CARDS.filter(c => unlockedCards.has(c.id))
  const locked = CARDS.filter(c => !unlockedCards.has(c.id))

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-5 pb-28">
        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Ma collection
          </p>
          <span className="text-xs text-zinc-600 font-mono">{unlockedCards.size}/{CARDS.length}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[...unlocked, ...locked].map((card, i) => {
            const isLocked = !unlockedCards.has(card.id)
            const { border, badge, glow } = RARITY_CLR[card.rarity]
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={!isLocked ? { y: -4, scale: 1.02 } : undefined}
                whileTap={!isLocked ? { scale: 0.97 } : undefined}
                onClick={() => !isLocked && setSelected(card)}
                className={`bg-[#1C1C1C] rounded-2xl overflow-hidden border cursor-pointer transition-shadow ${isLocked ? 'opacity-40 filter blur-[6px] brightness-50 saturate-50 cursor-default pointer-events-none' : ''}`}
                style={{
                  borderColor: isLocked ? 'rgba(255,255,255,0.06)' : border,
                  boxShadow: isLocked ? 'none' : `0 0 24px -8px ${glow}`,
                }}
              >
                <div className="relative aspect-[2/3] w-full">
                  <Image src={card.image} alt={card.name} fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-3 text-center">
                  <div className="text-[12px] font-semibold text-zinc-200 leading-tight mb-1.5">{card.name}</div>
                  <div className="text-[10px] text-zinc-500 leading-snug mb-2">{card.cond}</div>
                  <span className={`inline-block text-[9px] font-extrabold uppercase tracking-[0.6px] px-2 py-0.5 rounded-md text-white ${badge}`}>
                    {RARITY_LBL[card.rarity]}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

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
                tiltLimit={12}
                scale={1.02}
                perspective={1000}
                effect="gravitate"
                spotlight
                className="rounded-3xl bg-[#141414] border text-center"
                style={{
                  borderColor: RARITY_CLR[selected.rarity].border,
                  boxShadow: `0 0 60px -10px ${RARITY_CLR[selected.rarity].glow}`,
                }}
              >
                <div className="relative aspect-[2/3] w-full">
                  <Image src={selected.image} alt={selected.name} fill className="object-cover rounded-t-3xl" sizes="240px" />
                </div>
                <div className="p-5">
                  <div className="text-base font-bold text-white mb-1">{selected.name}</div>
                  <div className="text-xs text-zinc-400 mb-4">{selected.cond}</div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full py-2.5 rounded-xl bg-[#1C1C1C] border border-white/[0.06] text-sm font-medium text-zinc-300"
                  >
                    Retour
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
