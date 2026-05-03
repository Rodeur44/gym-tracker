'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, LogOut } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import HomeScreen from '@/components/screens/HomeScreen'
import LogScreen from '@/components/screens/LogScreen'
import HistoryScreen from '@/components/screens/HistoryScreen'
import ProgressScreen from '@/components/screens/ProgressScreen'
import CardsScreen from '@/components/screens/CardsScreen'

type Tab = 'home' | 'log' | 'history' | 'prog' | 'cards'

const NAV = [
  { id: 'home' as Tab, label: 'Accueil', icon: Home },
  { id: 'log' as Tab, label: 'Séance', icon: Plus },
  { id: 'history' as Tab, label: 'Historique', icon: Clock },
  { id: 'prog' as Tab, label: 'Progrès', icon: BarChart2 },
  { id: 'cards' as Tab, label: 'Cartes', icon: LayoutGrid },
]

const SCREENS = {
  home: HomeScreen,
  log: LogScreen,
  history: HistoryScreen,
  prog: ProgressScreen,
  cards: CardsScreen,
}

const slideVariants: Variants = {
  initial: (d: number) => ({ opacity: 0, x: d * 50 }),
  animate: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -25 }),
}

const snapVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('home')
  const [direction, setDirection] = useState(1)
  const [scrubbing, setScrubbing] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const navDragging = useRef(false)
  const tabRef = useRef(tab)
  tabRef.current = tab

  const { user, signOut, editMode, repeatPending, clearRepeat } = useApp()

  // ── Tab navigation with direction ────────────────────────────
  const goTo = useCallback((newTab: Tab, anim: 'slide' | 'snap' = 'slide') => {
    setScrubbing(anim === 'snap')
    setDirection(() => {
      const from = NAV.findIndex(n => n.id === tabRef.current)
      const to = NAV.findIndex(n => n.id === newTab)
      return to >= from ? 1 : -1
    })
    setTab(newTab)
  }, [])

  const navigateDir = useCallback((dir: 1 | -1) => {
    setScrubbing(false)
    setDirection(dir)
    setTab(prev => {
      const idx = NAV.findIndex(n => n.id === prev)
      const next = idx + dir
      if (next < 0 || next >= NAV.length) return prev
      return NAV[next].id
    })
  }, [])

  useEffect(() => {
    if (editMode) { setScrubbing(false); setDirection(1); setTab('log') }
  }, [editMode])

  useEffect(() => {
    if (repeatPending) { setScrubbing(false); setDirection(1); setTab('log'); clearRepeat() }
  }, [repeatPending, clearRepeat])

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  // ── Swipe on content — native listeners to allow preventDefault ─
  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    let startX = 0
    let startY = 0
    let lock: 'none' | 'h' | 'v' = 'none'

    function onStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      lock = 'none'
    }

    function onMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (lock === 'none' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        lock = Math.abs(dx) > Math.abs(dy) * 0.75 ? 'h' : 'v'
      }

      // Block vertical scroll while a horizontal swipe is in progress
      if (lock === 'h') e.preventDefault()
    }

    function onEnd(e: TouchEvent) {
      if (lock !== 'h') return
      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) < 65) return
      navigateDir(dx < 0 ? 1 : -1)
      lock = 'none'
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [navigateDir])

  // ── Nav bar scrubbing ─────────────────────────────────────────
  function onNavPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    navDragging.current = true
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
  }

  function onNavPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!navDragging.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.min(NAV.length - 1, Math.max(0, Math.floor((x / rect.width) * NAV.length)))
    const hovered = NAV[idx].id
    if (hovered !== tabRef.current) goTo(hovered, 'snap')
  }

  function onNavPointerUp() {
    navDragging.current = false
    setScrubbing(false)
  }

  const name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '?'
  const initials = name[0].toUpperCase()
  const Screen = SCREENS[tab]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="text-xl font-semibold tracking-tight">
          Gym<span className="text-[#A78BFA] drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">Log</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
          </span>
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#A78BFA] flex items-center justify-center text-[13px] font-semibold text-[#A78BFA] transition-all duration-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
              aria-label="Profil"
            >
              {initials}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-10 w-52 bg-[#1C1C1C] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.4px]">Connecté en tant que</p>
                    <p className="text-sm font-medium text-zinc-200 mt-0.5 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); signOut() }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} strokeWidth={1.8} />
                    Se déconnecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Screen */}
      <main ref={mainRef} className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={scrubbing ? snapVariants : slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={scrubbing
              ? { duration: 0.1, ease: 'easeOut' }
              : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
            }
            className="h-full"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="glass-strong border-t border-white/[0.06] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div
          ref={navRef}
          className="flex"
          onPointerDown={onNavPointerDown}
          onPointerMove={onNavPointerMove}
          onPointerUp={onNavPointerUp}
          onPointerLeave={onNavPointerUp}
        >
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => goTo(id)}
                className="flex-1 flex flex-col items-center gap-1 pt-3 relative"
                style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full bg-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.8)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: active ? 1.1 : 1, y: active ? -1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2 : 1.8}
                    className={active ? 'text-[#A78BFA] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-zinc-500'}
                  />
                </motion.div>
                <span className={`text-[9px] font-medium tracking-wide ${active ? 'text-[#A78BFA]' : 'text-zinc-600'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
