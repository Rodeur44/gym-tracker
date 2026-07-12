'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Timer } from 'lucide-react'
import { useApp } from '@/context/AppContext'

// Pouls de séance — remplace la date du header pendant une séance active :
// chrono · volume soulevé (séries cochées) · séries n/m.
// Hors séance (ou en mode modification), affiche la date comme avant.

function fmtElapsed(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

function fmtVol(kg: number) {
  if (kg >= 10000) return `${(kg / 1000).toFixed(1).replace('.', ',')}T`
  return `${kg.toLocaleString('fr-FR')}kg`
}

export default function SessionPulse() {
  const { currentExos, sessionStartedAt, editMode } = useApp()
  const active = currentExos.length > 0 && !editMode && sessionStartedAt !== null

  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!active || !sessionStartedAt) return
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active, sessionStartedAt])

  if (!active) {
    return (
      <span className="text-[11px] text-zinc-500 font-mono">
        {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
      </span>
    )
  }

  const setsTotal = currentExos.reduce((a, e) => a + e.sets.length, 0)
  const setsDone = currentExos.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)
  const volume = currentExos.reduce(
    (a, e) => a + e.sets.filter(s => s.done).reduce((x, s) => x + (s.weight || 0) * (s.reps || 0), 0),
    0
  )

  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-full border"
      style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)' }}
    >
      <span className="flex items-center gap-1 text-[#A78BFA] font-semibold">
        <Timer size={11} strokeWidth={2} />
        {fmtElapsed(elapsed)}
      </span>
      {volume > 0 && <span className="text-zinc-400">{fmtVol(volume)}</span>}
      <span className="text-zinc-400">{setsDone}/{setsTotal}</span>
    </motion.span>
  )
}
