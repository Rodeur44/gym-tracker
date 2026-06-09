'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import type { GymCard } from '@/types'
import { RARITY_STYLE, type CardProgress } from '@/lib/cards'
import { cn } from '@/lib/utils'

interface CardFrameProps {
  card: GymCard
  locked?: boolean
  progress?: CardProgress
  size?: 'sm' | 'lg'
  className?: string
}

// Shared collectible-card visual: premium rarity frame (foil sheen + inner
// reflection) + illustration window + a clean text panel (name / condition /
// progress). Used by the grid, the detail modal and the unlock reveal.
export function CardFrame({ card, locked = false, progress, size = 'sm', className }: CardFrameProps) {
  const r = RARITY_STYLE[card.rarity]
  const Icon = card.icon
  const lg = size === 'lg'

  return (
    <div
      className={cn('relative flex flex-col h-full rounded-2xl overflow-hidden', className)}
      style={{
        background: '#0e0e12',
        border: `1.5px solid ${locked ? 'rgba(255,255,255,0.10)' : r.clr}`,
        boxShadow: locked
          ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
          : `0 0 ${lg ? 54 : 24}px -10px ${r.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
      }}
    >
      {/* Inner reflection ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-30"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 1px rgba(255,255,255,0.10)' }}
      />

      {/* Illustration window */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden"
        style={{ background: locked ? 'linear-gradient(155deg,#17171c,#0c0c0f)' : r.grad }}
      >
        {card.art ? (
          <Image
            src={card.art}
            alt={card.name}
            fill
            draggable={false}
            // Top-anchored zoom crops the bottom edge (stray signatures / borders).
            style={{ transform: 'scale(1.08)', transformOrigin: 'top center' }}
            className={cn('object-cover select-none', locked && 'grayscale brightness-[0.4] blur-[5px] scale-[1.18]')}
            sizes={lg ? '244px' : '200px'}
          />
        ) : (
          <>
            {!locked && (
              <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${r.glow}, transparent 65%)` }} />
            )}
            <Icon
              size={lg ? 76 : 46}
              strokeWidth={1.6}
              className={cn('relative z-10', locked && 'blur-[2px]')}
              style={{ color: locked ? '#3f3f46' : '#ffffff', filter: locked ? 'none' : `drop-shadow(0 0 14px ${r.glow})` }}
            />
          </>
        )}

        {/* Bottom fade so the art blends into the text panel */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top,#0e0e12,transparent)' }} />

        {/* Foil sheen */}
        {!locked && (
          lg ? (
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
              initial={{ x: '-120%' }}
              animate={{ x: '120%' }}
              transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.8 }}
              style={{ background: 'linear-gradient(110deg,transparent 35%,rgba(255,255,255,0.55) 50%,transparent 65%)' }}
            />
          ) : card.rarity !== 'rare' ? (
            <div aria-hidden className="absolute inset-0 pointer-events-none z-20 opacity-30 mix-blend-overlay" style={{ background: 'linear-gradient(115deg,transparent 38%,rgba(255,255,255,0.5) 50%,transparent 62%)' }} />
          ) : null
        )}

        {/* Locked: centered lock */}
        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className={cn('rounded-full bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-sm', lg ? 'w-12 h-12' : 'w-9 h-9')}>
              <Lock size={lg ? 20 : 15} strokeWidth={2} className="text-zinc-400" />
            </div>
          </div>
        )}

        {/* Rarity badge (unlocked) */}
        {!locked && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <span
              className={cn('font-extrabold uppercase tracking-[0.6px] rounded-md text-white', lg ? 'text-[10px] px-2.5 py-1' : 'text-[8px] px-2 py-0.5')}
              style={{ background: r.clr, boxShadow: `0 0 10px ${r.glow}` }}
            >
              {r.lbl}
            </span>
          </div>
        )}
      </div>

      {/* Text panel */}
      <div
        className={cn('relative z-10', lg ? 'px-4 pt-3 pb-4' : 'px-3 pt-2.5 pb-3')}
        style={{
          background: 'linear-gradient(180deg,#141418,#0c0c0f)',
          borderTop: `1px solid ${locked ? 'rgba(255,255,255,0.06)' : r.clr + '55'}`,
        }}
      >
        <div className={cn('font-semibold tracking-tight leading-tight truncate', lg ? 'text-[16px]' : 'text-[12.5px]', locked ? 'text-zinc-300' : 'text-white')}>
          {card.name}
        </div>
        <div className={cn('text-zinc-500 leading-snug mt-1', lg ? 'text-[11px]' : 'text-[10px]')}>{card.cond}</div>

        {locked && progress ? (
          <div className={cn(lg ? 'mt-3' : 'mt-2.5')}>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${progress.pct}%`, background: `linear-gradient(90deg,${r.clr}aa,${r.clr})`, boxShadow: `0 0 8px ${r.glow}` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className={cn('font-mono text-zinc-500', lg ? 'text-[11px]' : 'text-[9.5px]')}>{progress.label}</span>
              <span className={cn('font-mono font-bold', lg ? 'text-[11px]' : 'text-[9.5px]')} style={{ color: r.clr }}>{progress.pct}%</span>
            </div>
          </div>
        ) : !locked ? (
          <div className={cn('flex items-center gap-1.5', lg ? 'mt-3' : 'mt-2')}>
            <span className="h-[2px] flex-1 rounded-full" style={{ background: `linear-gradient(90deg,transparent,${r.clr})`, opacity: 0.6 }} />
            <span className={cn('font-bold uppercase tracking-[1px]', lg ? 'text-[9px]' : 'text-[8px]')} style={{ color: r.clr }}>Obtenue</span>
            <span className="h-[2px] flex-1 rounded-full" style={{ background: `linear-gradient(90deg,${r.clr},transparent)`, opacity: 0.6 }} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
