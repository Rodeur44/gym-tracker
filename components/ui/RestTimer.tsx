'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, X, Plus, Minus, Settings2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const PRESETS = [60, 90, 120, 180]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function RestTimer() {
  const { restActive, restEndsAt, restDuration, startRest, stopRest, addRest, setDefaultRest } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [picker, setPicker] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastEndedRef = useRef<number | null>(null)

  // Tick every 200ms while active
  useEffect(() => {
    if (!restActive) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [restActive])

  // Detect end of timer → beep + stop
  useEffect(() => {
    if (!restActive || restEndsAt == null) return
    if (now >= restEndsAt && lastEndedRef.current !== restEndsAt) {
      lastEndedRef.current = restEndsAt
      playBeep()
      // iOS Safari ignores vibrate but harmless on other platforms
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate?.([200, 80, 200]) } catch {}
      }
      // Briefly show the "done" state then auto-dismiss
      window.setTimeout(() => { stopRest(); setExpanded(false) }, 1200)
    }
  }, [now, restActive, restEndsAt, stopRest])

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        const Ctx = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || window.AudioContext
        audioCtxRef.current = new Ctx()
      }
      const ctx = audioCtxRef.current!
      // Resume if suspended (iOS may suspend after backgrounding)
      if (ctx.state === 'suspended') ctx.resume()
      const t0 = ctx.currentTime
      const beep = (freq: number, when: number, dur = 0.14) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, when)
        gain.gain.exponentialRampToValueAtTime(0.35, when + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(when)
        osc.stop(when + dur + 0.02)
      }
      beep(880, t0)
      beep(1100, t0 + 0.18)
      beep(1320, t0 + 0.36, 0.22)
    } catch {
      // Audio not available — silent fail
    }
  }

  const remaining = restEndsAt && restActive ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0
  const progress = restEndsAt && restActive ? Math.max(0, Math.min(1, 1 - remaining / restDuration)) : 0
  const justFinished = restActive && remaining === 0

  return (
    <>
      {/* Bottom-right pill / FAB — always visible above the bottom nav */}
      <div
        className="fixed right-4 z-40"
        style={{ bottom: 'calc(82px + env(safe-area-inset-bottom, 16px))' }}
      >
        {!restActive ? (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => startRest()}
            onContextMenu={e => { e.preventDefault(); setPicker(true) }}
            className="h-12 px-4 rounded-full flex items-center gap-2 text-[13px] font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
              boxShadow: '0 8px 24px -6px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
            aria-label="Démarrer un repos"
          >
            <Timer size={16} strokeWidth={1.8} />
            Repos · {restDuration}s
            <button
              onClick={e => { e.stopPropagation(); setPicker(true) }}
              className="ml-1 -mr-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/25"
              aria-label="Régler la durée"
            >
              <Settings2 size={13} strokeWidth={1.8} />
            </button>
          </motion.button>
        ) : (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setExpanded(true)}
            className="relative h-12 px-4 rounded-full flex items-center gap-2 text-[13px] font-semibold text-white overflow-hidden"
            style={{
              background: justFinished
                ? 'linear-gradient(135deg,#059669,#10B981)'
                : 'linear-gradient(135deg,#6D28D9,#7C3AED)',
              boxShadow: justFinished
                ? '0 8px 28px -6px rgba(16,185,129,0.6),0 0 28px rgba(16,185,129,0.45)'
                : '0 8px 28px -6px rgba(109,40,217,0.6),0 0 24px rgba(139,92,246,0.45),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
            aria-label={justFinished ? 'Repos terminé' : 'Voir le timer'}
          >
            {/* Progress fill behind text */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20 pointer-events-none"
              style={{ width: `${progress * 100}%`, transition: 'width 200ms linear' }}
            />
            <Timer size={16} strokeWidth={1.8} className="relative" />
            <span className="relative font-mono">{justFinished ? 'TERMINÉ' : fmt(remaining)}</span>
          </motion.button>
        )}
      </div>

      {/* Expanded timer overlay */}
      <AnimatePresence>
        {expanded && restActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center px-6"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-3xl p-6 border relative"
              style={{
                background: 'linear-gradient(180deg,#141414,#0F0F0F)',
                borderColor: 'rgba(139,92,246,0.25)',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6), 0 0 60px -20px rgba(139,92,246,0.45)',
              }}
            >
              <button
                onClick={() => setExpanded(false)}
                aria-label="Fermer"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-400 active:scale-95 transition-transform"
              >
                <X size={16} strokeWidth={1.8} />
              </button>

              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.6px] text-center">Repos en cours</p>

              {/* Circular progress */}
              <div className="relative mx-auto mt-4 w-[200px] h-[200px]">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke={justFinished ? '#10B981' : '#A78BFA'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={(1 - progress) * 2 * Math.PI * 44}
                    style={{ transition: 'stroke-dashoffset 200ms linear, stroke 300ms ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[44px] font-extrabold text-white font-mono leading-none tracking-tight">
                    {justFinished ? '✓' : fmt(remaining)}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.6px] mt-1.5">
                    {justFinished ? 'C\'est reparti' : `sur ${fmt(restDuration)}`}
                  </span>
                </div>
              </div>

              {/* +/- controls */}
              {!justFinished && (
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    onClick={() => addRest(-15)}
                    className="h-11 px-4 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center gap-1.5 text-zinc-200 text-[13px] font-semibold active:scale-95 transition-transform"
                  >
                    <Minus size={14} strokeWidth={2} /> 15s
                  </button>
                  <button
                    onClick={() => addRest(15)}
                    className="h-11 px-4 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center gap-1.5 text-zinc-200 text-[13px] font-semibold active:scale-95 transition-transform"
                  >
                    <Plus size={14} strokeWidth={2} /> 15s
                  </button>
                </div>
              )}

              {/* Skip / done */}
              <button
                onClick={() => { stopRest(); setExpanded(false) }}
                className="w-full mt-4 h-11 rounded-xl text-[13px] font-semibold text-white border border-white/[0.08] bg-[#1C1C1C] hover:bg-[#222] active:scale-[0.98] transition-all"
              >
                {justFinished ? 'Fermer' : 'Passer le repos'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default duration picker */}
      <AnimatePresence>
        {picker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-md flex items-end justify-center"
            onClick={() => setPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[430px] rounded-t-3xl p-5 pb-8 border-t border-white/[0.08]"
              style={{
                background: '#141414',
                paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <div className="w-12 h-1 rounded-full bg-white/15 mx-auto mb-4" />
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] text-center mb-4">Durée par défaut</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESETS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setDefaultRest(s); setPicker(false) }}
                    className={`h-12 rounded-xl border text-sm font-semibold font-mono transition-all ${
                      restDuration === s
                        ? 'text-white border-[#A78BFA] bg-[rgba(139,92,246,0.18)] shadow-[0_0_0_3px_rgba(139,92,246,0.18)]'
                        : 'text-zinc-300 border-white/[0.08] bg-[#1C1C1C] active:scale-95'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setDefaultRest(restDuration - 15)}
                  className="w-12 h-12 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-95"
                  aria-label="Diminuer 15s"
                >
                  <Minus size={16} strokeWidth={2} />
                </button>
                <div className="flex-1 h-12 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center font-mono text-base font-semibold text-white">
                  {fmt(restDuration)}
                </div>
                <button
                  onClick={() => setDefaultRest(restDuration + 15)}
                  className="w-12 h-12 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center text-zinc-300 active:scale-95"
                  aria-label="Augmenter 15s"
                >
                  <Plus size={16} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
