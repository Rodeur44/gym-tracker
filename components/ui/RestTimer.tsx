'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, X, Plus, Minus, Settings2, Volume2, Bell } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const PRESETS = [60, 90, 120, 180]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function RestTimer() {
  const { restActive, restEndsAt, restDuration, startRest, stopRest, addRest, setDefaultRest, testBeep } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [picker, setPicker] = useState(false)
  const [testingNotif, setTestingNotif] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const lastEndedRef = useRef<number | null>(null)

  async function testNotif() {
    if (testingNotif) return
    setTestingNotif(true)
    setTestMsg(null)
    try {
      const res = await fetch('/api/push/test', { method: 'POST' })
      const d = await res.json().catch(() => ({}))
      if (d.ok) {
        setTestMsg({ ok: true, text: 'Notification envoyée ! Tu devrais la voir apparaître. 🔔' })
      } else if (d.found === 0) {
        setTestMsg({ ok: false, text: "Active d'abord « Rappels de séance » dans le menu profil (avatar)." })
      } else {
        setTestMsg({ ok: false, text: "Envoi impossible. Réessaie dans un instant." })
      }
    } catch {
      setTestMsg({ ok: false, text: 'Pas de connexion. Réessaie.' })
    } finally {
      setTestingNotif(false)
    }
  }

  // Tick every 200ms while active
  useEffect(() => {
    if (!restActive) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [restActive])

  // Detect end of timer (visual only — the beep is scheduled at start)
  useEffect(() => {
    if (!restActive || restEndsAt == null) return
    if (now >= restEndsAt && lastEndedRef.current !== restEndsAt) {
      lastEndedRef.current = restEndsAt
      // Vibration as a fallback for non-iOS devices that support it
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate?.([200, 80, 200]) } catch {}
      }
      // Show the "done" state briefly then auto-dismiss
      window.setTimeout(() => { stopRest(); setExpanded(false) }, 1500)
    }
  }, [now, restActive, restEndsAt, stopRest])

  const remaining = restEndsAt && restActive ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0
  const progress = restEndsAt && restActive ? Math.max(0, Math.min(1, 1 - remaining / restDuration)) : 0
  const justFinished = restActive && remaining === 0
  const isLow = remaining <= 10 && remaining > 0 && !justFinished
  const isMid = remaining <= 30 && remaining > 10 && !justFinished

  const arcColor = justFinished ? '#10B981' : isLow ? '#F87171' : isMid ? '#FBBF24' : 'url(#arc-grad)'
  const arcColorSolid = justFinished ? '#10B981' : isLow ? '#F87171' : isMid ? '#FBBF24' : '#A78BFA'

  // Dégradé de fond du bouton actif selon l'état (bien distinct).
  const activeBg = justFinished
    ? 'linear-gradient(135deg,#059669,#10B981)'
    : isLow
    ? 'linear-gradient(135deg,#B91C1C,#EF4444)'
    : isMid
    ? 'linear-gradient(135deg,#B45309,#F59E0B)'
    : 'linear-gradient(135deg,#6D28D9,#7C3AED)'
  const activeGlow = justFinished
    ? '0 10px 30px -4px rgba(16,185,129,0.7),0 0 36px rgba(16,185,129,0.55)'
    : isLow
    ? '0 10px 30px -4px rgba(239,68,68,0.7),0 0 32px rgba(239,68,68,0.5)'
    : isMid
    ? '0 10px 30px -4px rgba(245,158,11,0.6),0 0 28px rgba(245,158,11,0.45)'
    : '0 10px 30px -4px rgba(109,40,217,0.6),0 0 28px rgba(139,92,246,0.5)'

  return (
    <>
      {/* Bottom-right pill / FAB — always visible above the bottom nav */}
      <div
        className="fixed right-4 z-40"
        style={{ bottom: 'calc(82px + env(safe-area-inset-bottom, 16px))' }}
      >
        {!restActive ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="h-12 rounded-full flex items-center text-[13px] font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
              boxShadow: '0 8px 24px -6px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startRest()}
              onContextMenu={e => { e.preventDefault(); setPicker(true) }}
              className="h-12 pl-4 pr-1 rounded-l-full flex items-center gap-2"
              aria-label="Démarrer un repos"
            >
              <Timer size={16} strokeWidth={1.8} />
              Repos · {restDuration}s
            </motion.button>
            <button
              onClick={() => setPicker(true)}
              className="h-12 min-w-11 pr-2 rounded-r-full flex items-center justify-center"
              aria-label="Régler la durée"
            >
              <span className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 active:bg-white/25">
                <Settings2 size={13} strokeWidth={1.8} />
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: justFinished ? [1, 1.12, 1] : isLow ? [1, 1.06, 1] : [1, 1.025, 1],
              opacity: 1,
            }}
            transition={{
              scale: { repeat: Infinity, duration: justFinished ? 0.5 : isLow ? 0.7 : 2.4, ease: 'easeInOut' },
            }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setExpanded(true)}
            className="relative h-14 pl-3 pr-5 rounded-full flex items-center gap-2.5 text-[15px] font-bold text-white overflow-hidden"
            style={{ background: activeBg, boxShadow: `${activeGlow},inset 0 1px 0 rgba(255,255,255,0.2)` }}
            aria-label={justFinished ? 'Repos terminé' : 'Voir le timer'}
          >
            {/* Progress fill behind text */}
            <div
              className="absolute inset-y-0 left-0 pointer-events-none rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'rgba(255,255,255,0.2)',
                transition: 'width 200ms linear',
              }}
            />
            <span className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Timer size={17} strokeWidth={2} />
            </span>
            <span className="relative font-mono tabular-nums tracking-tight">{justFinished ? 'TERMINÉ' : fmt(remaining)}</span>
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
                className="absolute top-2 right-2 min-w-11 min-h-11 flex items-center justify-center text-zinc-400 active:scale-95 transition-transform"
              >
                <span className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <X size={16} strokeWidth={1.8} />
                </span>
              </button>

              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.6px] text-center">Repos en cours</p>

              {/* Circular progress */}
              <div className="relative mx-auto mt-4 w-[200px] h-[200px]">
                {/* Outer glow when low time */}
                {isLow && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ boxShadow: '0 0 40px 8px rgba(248,113,113,0.25)' }}
                  />
                )}
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <defs>
                    <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6D28D9" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                    <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {/* Track */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                  {/* Glow layer */}
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke={arcColorSolid}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={(1 - progress) * 2 * Math.PI * 44}
                    opacity="0.35"
                    filter="url(#arc-glow)"
                    style={{ transition: 'stroke-dashoffset 200ms linear, stroke 400ms ease' }}
                  />
                  {/* Main arc */}
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke={arcColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={(1 - progress) * 2 * Math.PI * 44}
                    style={{ transition: 'stroke-dashoffset 200ms linear, stroke 400ms ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={justFinished ? 'done' : 'counting'}
                    initial={justFinished ? { scale: 0.6, opacity: 0 } : false}
                    animate={justFinished ? { scale: 1, opacity: 1 } : isLow ? { scale: [1, 1.04, 1] } : {}}
                    transition={justFinished
                      ? { type: 'spring', stiffness: 400, damping: 20 }
                      : isLow ? { repeat: Infinity, duration: 1, ease: 'easeInOut' } : {}
                    }
                    className="text-[44px] font-extrabold font-mono leading-none tracking-tight"
                    style={{ color: justFinished ? '#10B981' : isLow ? '#F87171' : 'white' }}
                  >
                    {justFinished ? '✓' : fmt(remaining)}
                  </motion.span>
                  <span className="text-[10px] font-bold uppercase tracking-[1.6px] mt-1.5"
                    style={{ color: justFinished ? 'rgba(16,185,129,0.7)' : isLow ? 'rgba(248,113,113,0.6)' : 'rgb(113,113,122)' }}>
                    {justFinished ? "C'est reparti" : `sur ${fmt(restDuration)}`}
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
            onClick={() => { setPicker(false); setTestMsg(null) }}
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

              {/* Test sound */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={testBeep}
                  className="flex-1 h-11 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center gap-2 text-[13px] text-zinc-200 font-semibold active:scale-[0.98] transition-transform"
                >
                  <Volume2 size={14} strokeWidth={1.8} className="text-[#A78BFA]" />
                  Tester le son
                </button>
                <button
                  onClick={testNotif}
                  disabled={testingNotif}
                  className="flex-1 h-11 rounded-xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center gap-2 text-[13px] text-zinc-200 font-semibold active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  <Bell size={14} strokeWidth={1.8} className="text-[#A78BFA]" />
                  {testingNotif ? '…' : 'Tester la notif'}
                </button>
              </div>

              <AnimatePresence>
                {testMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] font-medium leading-relaxed mt-3 px-3 py-2.5 rounded-xl border text-center"
                    style={testMsg.ok
                      ? { color: '#34D399', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }
                      : { color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.22)' }}
                  >
                    {testMsg.text}
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-[11px] text-zinc-500 leading-relaxed mt-3 px-1 text-center">
                💡 Sur iPhone, le bip ne joue pas si le mode silencieux est activé (interrupteur sur le côté). Vérifie aussi le volume.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
