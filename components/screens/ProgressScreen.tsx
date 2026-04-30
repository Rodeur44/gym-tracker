'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'

export default function ProgressScreen() {
  const { sessions } = useApp()

  const map: Record<string, number> = {}
  sessions.forEach(s => (s.exos || []).forEach(e => {
    const w = Math.max(0, ...e.sets.map(s => s.weight || 0))
    if (w > 0 && (!map[e.name] || w > map[e.name])) map[e.name] = w
  }))
  const top = Object.entries(map).sort((a, b) => b[1] - a[1])
  const mx = top[0]?.[1] || 1

  const totalVol = sessions.reduce((acc, s) => {
    return acc + s.exos.reduce((a, e) => a + e.sets.reduce((x, st) => x + (st.weight || 0) * (st.reps || 0), 0), 0)
  }, 0)

  const statCards = [
    { val: sessions.length, lbl: 'Séances totales' },
    { val: [...new Set(sessions.map(s => s.type))].length + '/5', lbl: 'Groupes entraînés' },
    { val: top[0] ? `${top[0][1]}kg` : '—', lbl: top[0]?.[0] || 'Meilleur record' },
    { val: Math.round(totalVol / 1000) + 'T', lbl: 'Volume total soulevé' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 pt-5 pb-28 flex flex-col gap-5"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ val, lbl }, i) => (
          <motion.div
            key={lbl}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

      {/* Records bar chart */}
      <div>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          Records
        </p>
        <div className="card-glass rounded-2xl p-4">
          {!top.length ? (
            <p className="text-sm text-zinc-600 text-center py-4">Enregistre des séances pour voir tes progrès !</p>
          ) : top.slice(0, 10).map(([name, w], i) => (
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
      </div>
    </motion.div>
  )
}
