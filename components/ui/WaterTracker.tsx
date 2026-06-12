'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Plus, Minus, RotateCcw, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const GOAL_KEY = 'gymlog_water_goal'
const DEFAULT_GOAL = 2000

const QUICK_ADD = [150, 250, 500]
const CUSTOM_STEP = 50

function WaveCircle({ ml, goal, celebrated }: { ml: number; goal: number; celebrated: boolean }) {
  const pct = Math.min((ml / goal) * 100, 100)
  const reached = pct >= 100

  const litres = (ml / 1000).toFixed(2).replace(/\.?0+$/, '') || '0'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circle */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          width: 148,
          height: 148,
          borderRadius: '50%',
          border: reached
            ? '2px solid rgba(34,197,94,0.45)'
            : '2px solid rgba(14,165,233,0.35)',
          background: reached
            ? 'rgba(34,197,94,0.04)'
            : 'rgba(14,165,233,0.04)',
          boxShadow: reached
            ? '0 0 28px -6px rgba(34,197,94,0.35)'
            : '0 0 28px -6px rgba(14,165,233,0.25)',
        }}
      >
        {/* Water fill */}
        <motion.div
          className="absolute left-0 right-0 bottom-0"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 40, damping: 14 }}
          style={{
            background: reached
              ? 'linear-gradient(180deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.6) 100%)'
              : 'linear-gradient(180deg, rgba(56,189,248,0.15) 0%, rgba(2,132,199,0.65) 100%)',
          }}
        >
          {/* Wave 1 */}
          <svg
            viewBox="0 0 400 28"
            preserveAspectRatio="none"
            className="absolute top-[-14px] left-0 wave-primary"
            style={{ width: '200%', height: 28 }}
          >
            <path
              d="M0 14 C33 4,67 24,100 14 S167 4,200 14 S267 24,300 14 S367 4,400 14 V28 H0 Z"
              fill={reached ? 'rgba(34,197,94,0.55)' : 'rgba(14,165,233,0.6)'}
            />
          </svg>
          {/* Wave 2 */}
          <svg
            viewBox="0 0 400 28"
            preserveAspectRatio="none"
            className="absolute top-[-8px] left-0 wave-secondary"
            style={{ width: '200%', height: 22, opacity: 0.45 }}
          >
            <path
              d="M0 14 C33 24,67 4,100 14 S167 24,200 14 S267 4,300 14 S367 24,400 14 V28 H0 Z"
              fill={reached ? 'rgba(74,222,128,0.7)' : 'rgba(56,189,248,0.7)'}
            />
          </svg>
        </motion.div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {celebrated ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-0.5"
              >
                <Check size={28} strokeWidth={2.5} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-400 tracking-[1px] uppercase">Objectif !</span>
              </motion.div>
            ) : (
              <motion.div
                key="amount"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <span
                  className="text-[26px] font-bold font-mono leading-none"
                  style={{ color: reached ? '#4ade80' : '#e0f2fe' }}
                >
                  {litres}
                </span>
                <span className="text-[11px] font-mono mt-0.5" style={{ color: reached ? '#86efac' : '#7dd3fc' }}>
                  L
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress label */}
      <div className="flex items-center gap-1.5">
        <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 14 }}
            style={{
              background: reached
                ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                : 'linear-gradient(90deg,#0284c7,#38bdf8)',
            }}
          />
        </div>
        <span className="text-[11px] font-mono text-zinc-500">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

export default function WaterTracker() {
  const [ml, setMl] = useState(0)
  const [goal, setGoal] = useState(DEFAULT_GOAL)
  const [loading, setLoading] = useState(true)
  const [celebrated, setCelebrated] = useState(false)
  const [justAdded, setJustAdded] = useState(0)
  const [customMl, setCustomMl] = useState(200)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await sb.from('water_logs').select('total_ml').eq('user_id', user.id).eq('date', today).single()
    if (data) setMl(data.total_ml)
    const saved = parseInt(localStorage.getItem(GOAL_KEY) || '', 10)
    if (!Number.isNaN(saved) && saved >= 500) setGoal(saved)
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const addWater = useCallback(async (amount: number) => {
    const newMl = Math.max(0, ml + amount)
    const wasBelow = ml < goal
    setMl(newMl)
    setJustAdded(amount)
    setTimeout(() => setJustAdded(0), 1200)

    if (wasBelow && newMl >= goal) {
      setCelebrated(true)
      setTimeout(() => setCelebrated(false), 2500)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 30, 80])
    }

    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('water_logs').upsert(
      { user_id: user.id, date: today, total_ml: newMl },
      { onConflict: 'user_id,date' }
    )
  }, [ml, goal, today])

  const reset = useCallback(async () => {
    setMl(0)
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('water_logs').upsert(
      { user_id: user.id, date: today, total_ml: 0 },
      { onConflict: 'user_id,date' }
    )
  }, [today])

  if (loading) return (
    <div className="rounded-2xl shimmer-block" style={{ height: 260 }} />
  )

  const goalL = (goal / 1000).toFixed(1)

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets size={16} strokeWidth={1.8} className="text-sky-400" />
          <span className="text-[13px] font-semibold text-zinc-200 tracking-tight">Hydratation du jour</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono">Objectif {goalL}L</span>
          {ml > 0 && (
            <button
              onClick={reset}
              aria-label="Réinitialiser"
              className="min-w-11 min-h-11 -m-2 flex items-center justify-center active:opacity-60 transition-opacity"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <RotateCcw size={12} strokeWidth={1.8} className="text-zinc-500" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Circle */}
      <div className="flex justify-center mb-4">
        <WaveCircle ml={ml} goal={goal} celebrated={celebrated} />
      </div>

      {/* Quick-add/remove buttons */}
      <div className="flex gap-2">
        {QUICK_ADD.map(amount => (
          <div key={amount} className="flex-1 flex flex-col gap-1.5">
            <motion.button
              onClick={() => addWater(amount)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center justify-center gap-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: justAdded === amount ? 'rgba(14,165,233,0.22)' : 'rgba(14,165,233,0.08)',
                border: justAdded === amount ? '1px solid rgba(14,165,233,0.45)' : '1px solid rgba(14,165,233,0.15)',
                color: '#38bdf8',
              }}
            >
              <Plus size={10} strokeWidth={2.5} />
              {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
            </motion.button>
            <motion.button
              onClick={() => addWater(-amount)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#71717a',
              }}
            >
              <Minus size={9} strokeWidth={2.5} />
              {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
            </motion.button>
          </div>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2 mt-2">
        <motion.button
          onClick={() => setCustomMl(v => Math.max(CUSTOM_STEP, v - CUSTOM_STEP))}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Diminuer"
          className="relative after:absolute after:-inset-1 w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Minus size={13} strokeWidth={2} className="text-zinc-400" />
        </motion.button>

        <div
          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-[13px] font-mono font-semibold text-zinc-200">{customMl}</span>
          <span className="text-[11px] text-zinc-500">ml</span>
        </div>

        <motion.button
          onClick={() => setCustomMl(v => v + CUSTOM_STEP)}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Augmenter"
          className="relative after:absolute after:-inset-1 w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Plus size={13} strokeWidth={2} className="text-zinc-400" />
        </motion.button>

        <motion.button
          onClick={() => addWater(customMl)}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="px-3 py-2.5 rounded-xl text-[12px] font-semibold flex-shrink-0"
          style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}
        >
          Ajouter
        </motion.button>

        <motion.button
          onClick={() => addWater(-customMl)}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="px-3 py-2.5 rounded-xl text-[12px] font-semibold flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717a' }}
        >
          Retirer
        </motion.button>
      </div>

      {/* Today total */}
      <p className="text-center text-[11px] text-zinc-600 mt-3 font-mono">
        {ml}ml / {goal}ml consommés
      </p>
    </div>
  )
}
