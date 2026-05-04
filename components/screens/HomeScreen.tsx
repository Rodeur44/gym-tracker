'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Zap, Crown, Sparkles, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { TYPE_LBL, TAG_CLR, TAG_BG, EXO_BY_TYPE } from '@/lib/constants'
import type { MuscleGroup, Session } from '@/types'
import { Counter } from '@/components/ui/animated-counter'

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
  const { sessions, unlockedCards, getBest, getStreak, getNextType, repeatSession, isPro, openPro } = useApp()
  const nt = getNextType()
  const streak = getStreak()
  const last = sessions[0]

  const aiSuggestion = useMemo(() => {
    const mainGroups: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes']
    const rested = mainGroups.map(type => {
      const lastS = sessions.find(s => s.type === type)
      const daysSince = lastS
        ? Math.floor((Date.now() - new Date(lastS.date + 'T12:00:00').getTime()) / 86400000)
        : 999
      return { type, daysSince }
    }).sort((a, b) => b.daysSince - a.daysSince)

    const { type, daysSince } = rested[0]

    const freq: Record<string, number> = {}
    sessions.filter(s => s.type === type).forEach(s =>
      s.exos.forEach(e => { freq[e.name] = (freq[e.name] || 0) + 1 })
    )
    const topNames = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n]) => n)
    const names = topNames.length >= 2 ? topNames : EXO_BY_TYPE[type].slice(0, 4)

    const exos = names.map(name => {
      const best = getBest(name)
      const target = best > 0 ? +(best + 2.5).toFixed(1) : 0
      return { name, target }
    })

    return { type, daysSince, exos }
  }, [sessions, getBest])

  function startAiSession() {
    const fake: Session = {
      id: 'ai',
      user_id: '',
      created_at: '',
      date: new Date().toISOString().slice(0, 10),
      type: aiSuggestion.type,
      notes: '',
      exos: aiSuggestion.exos.map(e => ({
        name: e.name,
        sets: [
          { weight: e.target, reps: 8 },
          { weight: e.target, reps: 8 },
          { weight: e.target, reps: 8 },
        ],
      })),
    }
    repeatSession(fake)
  }

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
              <div>
                <Counter end={sessions.length} fontSize={24} className="text-white tracking-tight" />
                <div className="text-[10px] text-white/50 uppercase tracking-[1.2px] mt-1">Séances</div>
              </div>
              <div>
                <Counter end={unlockedCards.size} fontSize={24} className="text-white tracking-tight" />
                <div className="text-[10px] text-white/50 uppercase tracking-[1.2px] mt-1">Cartes</div>
              </div>
              <div>
                {streak > 0 ? (
                  <Counter end={streak} fontSize={24} className="text-white tracking-tight" />
                ) : (
                  <div className="text-2xl font-bold font-mono text-white leading-none tracking-tight" style={{ height: 32 }}>—</div>
                )}
                <div className="text-[10px] text-white/50 uppercase tracking-[1.2px] mt-1">Jours streak</div>
              </div>
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
      {/* Pro CTA — only when not Pro */}
      {!isPro && (
        <motion.div variants={fadeUp}>
          <button
            onClick={openPro}
            className="w-full text-left rounded-2xl p-4 relative overflow-hidden border active:scale-[0.99] transition-transform"
            style={{
              background: 'linear-gradient(135deg,#1E0B3D 0%,#3B0764 35%,#5B21B6 75%,#7C3AED 100%)',
              borderColor: 'rgba(139,92,246,0.32)',
              boxShadow: '0 12px 32px -12px rgba(91,33,182,0.55), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="absolute -right-10 -top-12 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-10 w-24 h-24 rounded-full bg-black/30 blur-2xl pointer-events-none" />

            <div className="relative flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 flex-shrink-0">
                <Crown size={20} strokeWidth={2} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-[1.4px]">GymLog Pro</span>
                  <Sparkles size={11} strokeWidth={2} className="text-white/70" />
                </div>
                <h3 className="text-[15px] font-semibold text-white tracking-tight mt-0.5">Débloquer toutes les fonctionnalités</h3>
                <p className="text-[12px] text-white/70 mt-0.5">7 jours offerts · code d'invitation accepté</p>
              </div>
              <ChevronRight size={20} strokeWidth={2} className="text-white/80 flex-shrink-0" />
            </div>
          </button>
        </motion.div>
      )}

      {/* AI suggestion */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          Suggestion IA
        </p>
        <div className="card-glass rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[1.2px] mb-0.5">Muscle le plus reposé</div>
              <div className="text-sm font-semibold text-zinc-200">{TYPE_LBL[aiSuggestion.type]}</div>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 bg-[#1C1C1C] border border-white/[0.06] px-2.5 py-1 rounded-lg">
              {aiSuggestion.daysSince >= 999 ? 'Jamais' : `${aiSuggestion.daysSince}j repos`}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 mb-4">
            {aiSuggestion.exos.map(e => (
              <div key={e.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-none">
                <span className="text-sm text-zinc-300 truncate mr-3">{e.name}</span>
                {e.target > 0 ? (
                  <span className="text-[11px] font-mono font-semibold flex-shrink-0" style={{ color: TAG_CLR[aiSuggestion.type] }}>
                    Vise {e.target}kg
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-600 flex-shrink-0">poids libre</span>
                )}
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={startAiSession}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.45)' }}
          >
            <Zap size={16} strokeWidth={1.8} />
            Commencer cette séance
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
