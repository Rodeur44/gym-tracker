'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { TYPE_LBL, TAG_CLR, TAG_BG } from '@/lib/constants'
import type { MuscleGroup } from '@/types'

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.08 } }
}
const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function HomeScreen() {
  const { sessions, unlockedCards, getBest, getStreak, getNextType } = useApp()
  const nt = getNextType()
  const streak = getStreak()
  const last = sessions[0]

  const exoW = (e: { sets: { weight: number }[] }) => Math.max(0, ...e.sets.map(s => s.weight || 0))
  const exoSR = (e: { sets: { weight?: number; reps?: number }[] }) => `${e.sets.length}×${e.sets[0]?.reps || '?'}`

  const tip = (() => {
    const lastByType = sessions.find(s => s.type === nt)
    if (!lastByType) return `Première séance ${TYPE_LBL[nt]} — donne tout !`
    const e = lastByType.exos?.[0]
    const w = e ? exoW(e) : 0
    return e && w > 0
      ? `Dernière : ${fmtDate(lastByType.date)} — Vise ${(w + 2).toFixed(1).replace('.0', '')}kg sur ${e.name}`
      : `Dernière : ${fmtDate(lastByType.date)} — Augmente les reps !`
  })()

  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const now = new Date()
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().slice(0, 10)
    const has = sessions.some(s => s.date === ds)
    return { label: days[(d.getDay() + 6) % 7], has }
  })

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="px-4 pt-5 pb-28 flex flex-col gap-5"
    >
      {/* Hero next-card */}
      <motion.div variants={fadeUp}>
        <div className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#6D28D9 0%,#7C3AED 40%,#8B5CF6 75%,#A78BFA 100%)', boxShadow: '0 30px 60px -16px rgba(109,40,217,0.6),0 0 0 1px rgba(139,92,246,0.4),inset 0 1px 0 rgba(255,255,255,0.15)' }}>
          {/* Glow orbs */}
          <div className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/25 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-12 w-36 h-36 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          <div className="relative">
            <p className="text-[11px] font-bold text-white/55 uppercase tracking-[1.5px] mb-2">Prochaine séance</p>
            <h2 className="text-[42px] font-extrabold text-white leading-none tracking-[-2px] mb-3">
              {TYPE_LBL[nt]}
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">{tip}</p>

            {/* Stats row */}
            <div className="flex gap-7 mt-5 pt-4 border-t border-white/15">
              {[
                { num: sessions.length, lbl: 'Séances' },
                { num: unlockedCards.size, lbl: 'Cartes' },
                { num: streak || '—', lbl: 'Jours streak' },
              ].map(({ num, lbl }) => (
                <div key={lbl}>
                  <div className="text-2xl font-bold font-mono text-white leading-none tracking-tight">{num}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-[1.2px] mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last session */}
      {last && (
        <motion.div variants={fadeUp}>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Dernière séance
          </p>
          <div className="card-glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                style={{ color: TAG_CLR[last.type as MuscleGroup], background: TAG_BG[last.type as MuscleGroup], borderColor: `${TAG_CLR[last.type as MuscleGroup]}33` }}>
                {TYPE_LBL[last.type as MuscleGroup]}
              </span>
              <span className="text-xs text-zinc-500 font-mono">{fmtDate(last.date)}</span>
            </div>
            {(last.exos || []).slice(0, 4).map((e, i) => (
              <div key={i} className="flex items-center py-2.5 border-b border-white/[0.04] last:border-none gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TAG_CLR[last.type as MuscleGroup], boxShadow: `0 0 8px ${TAG_CLR[last.type as MuscleGroup]}66` }} />
                <span className="flex-1 text-sm text-zinc-200 tracking-tight">{e.name}</span>
                {exoW(e) > 0 && <span className="text-sm font-semibold font-mono" style={{ color: TAG_CLR[last.type as MuscleGroup] }}>{exoW(e)}kg</span>}
                <span className="text-[11px] text-zinc-500 font-mono bg-[#1C1C1C] px-2 py-0.5 rounded-lg border border-white/[0.06]">{exoSR(e)}</span>
              </div>
            ))}
            {(last.exos || []).length > 4 && (
              <p className="text-xs text-zinc-600 pt-2">+{last.exos.length - 4} exercices…</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Cette semaine */}
      <motion.div variants={fadeUp}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Cette semaine
          </p>
          {streak > 0 && (
            <span className="text-xs font-semibold text-[#A78BFA] font-mono">🔥 {streak} jour{streak > 1 ? 's' : ''} de suite</span>
          )}
        </div>
        <div className="card-glass rounded-2xl p-3">
          <div className="flex gap-2">
            {weekDots.map(({ label, has }, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`flex-1 aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${has ? 'text-white' : 'text-zinc-600 bg-[#1C1C1C] border border-white/[0.06]'}`}
                style={has ? { background: 'linear-gradient(135deg,#7C3AED,#8B5CF6)', boxShadow: '0 4px 12px -2px rgba(139,92,246,0.4),inset 0 1px 0 rgba(255,255,255,0.15)' } : {}}
              >
                <span className="text-[9px] font-bold tracking-wide">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
