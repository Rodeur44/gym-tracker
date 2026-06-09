'use client'

import Image from 'next/image'
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

// Shared collectible-card visual: rarity frame + illustration window (Lucide
// icon) + name/condition + progress (locked) or rarity badge (unlocked).
// Used by the grid, the detail modal and the unlock reveal so they never drift.
export function CardFrame({ card, locked = false, progress, size = 'sm', className }: CardFrameProps) {
  const r = RARITY_STYLE[card.rarity]
  const Icon = card.icon
  const lg = size === 'lg'

  return (
    <div
      className={cn('relative flex flex-col h-full rounded-2xl overflow-hidden border-2', className)}
      style={{
        borderColor: locked ? 'rgba(255,255,255,0.08)' : r.clr,
        background: '#121212',
        boxShadow: locked ? 'none' : `0 0 ${lg ? 50 : 22}px -8px ${r.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Illustration window */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden"
        style={{ background: locked ? 'linear-gradient(150deg,#161616,#0e0e0e)' : r.grad }}
      >
        {/* Illustration (if provided) fills the window; otherwise fall back to icon */}
        {card.art ? (
          <>
            <Image
              src={card.art}
              alt={card.name}
              fill
              draggable={false}
              // Slight top-anchored zoom crops the bottom edge, where the model
              // sometimes paints a fake signature / thin border.
              style={{ transform: 'scale(1.08)', transformOrigin: 'top center' }}
              className={cn('object-cover select-none', locked && 'grayscale brightness-[0.35]')}
              sizes={lg ? '244px' : '200px'}
            />
            {/* legibility + holo overlays */}
            <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)' }} />
            {!locked && card.rarity !== 'rare' && (
              <div
                aria-hidden
                className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
                style={{ background: 'linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.5) 47%,transparent 60%)' }}
              />
            )}
          </>
        ) : (
          <>
            {/* radial glow behind icon */}
            {!locked && (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 45%, ${r.glow}, transparent 65%)` }}
              />
            )}
            {/* holo sheen for epic / legendary */}
            {!locked && card.rarity !== 'rare' && (
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
                style={{ background: 'linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.5) 47%,transparent 60%)' }}
              />
            )}
            <Icon
              size={lg ? 76 : 46}
              strokeWidth={1.6}
              className="relative z-10"
              style={{ color: locked ? '#3f3f46' : '#ffffff', filter: locked ? 'none' : `drop-shadow(0 0 14px ${r.glow})` }}
            />
          </>
        )}
        {locked && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
            <Lock size={12} strokeWidth={2} className="text-zinc-500" />
          </div>
        )}
        {/* rarity badge top-left when unlocked */}
        {!locked && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={cn('font-extrabold uppercase tracking-[0.6px] rounded-md text-white', lg ? 'text-[10px] px-2.5 py-1' : 'text-[8px] px-2 py-0.5')}
              style={{ background: r.clr, boxShadow: `0 0 10px ${r.glow}` }}
            >
              {r.lbl}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={cn('text-center', lg ? 'px-4 pt-3.5' : 'px-2.5 pt-2.5')}>
        <div
          className={cn('font-semibold tracking-tight leading-tight', lg ? 'text-[16px]' : 'text-[12px]', locked ? 'text-zinc-300' : 'text-white')}
        >
          {card.name}
        </div>
        <div className={cn('text-zinc-500 leading-snug mt-0.5', lg ? 'text-[11px]' : 'text-[10px]')}>{card.cond}</div>
      </div>

      {/* Footer: progress (locked) or rarity label (unlocked) */}
      <div className={cn(lg ? 'px-4 pt-3 pb-4' : 'px-2.5 pt-2 pb-2.5')}>
        {locked && progress ? (
          <div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress.pct}%`, background: `linear-gradient(90deg,${r.clr}99,${r.clr})` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <span className={cn('font-mono text-zinc-500', lg ? 'text-[11px]' : 'text-[9px]')}>{progress.label}</span>
              <span className={cn('font-mono font-bold', lg ? 'text-[11px]' : 'text-[9px]')} style={{ color: r.clr }}>{progress.pct}%</span>
            </div>
          </div>
        ) : (
          <div
            className={cn('mx-auto rounded-full', lg ? 'h-1.5 w-16' : 'h-1 w-10')}
            style={{ background: `linear-gradient(90deg,transparent,${r.clr},transparent)`, opacity: 0.7 }}
          />
        )}
      </div>
    </div>
  )
}
