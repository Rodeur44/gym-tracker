'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, LogOut, Crown, PersonStanding, ShieldCheck, Pencil } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { createClient } from '@/lib/supabase/client'
import HomeScreen from '@/components/screens/HomeScreen'
import LogScreen from '@/components/screens/LogScreen'
import HistoryScreen from '@/components/screens/HistoryScreen'
import ProgressScreen from '@/components/screens/ProgressScreen'
import CardsScreen from '@/components/screens/CardsScreen'
import ProScreen from '@/components/screens/ProScreen'
import AdminScreen from '@/components/screens/AdminScreen'
import { RestTimer } from '@/components/ui/RestTimer'

const ADMIN_EMAIL = 'enbordigoni@gmail.com'

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

  const { user, signOut, editMode, repeatPending, clearRepeat, isPro, proOpen, openPro, closePro } = useApp()

  const [adminOpen, setAdminOpen] = useState(false)
  const isAdmin = user?.email === ADMIN_EMAIL

  // Pseudo prompt — shown once for users with no display_name (e.g. Google OAuth)
  const [pseudoOpen, setPseudoOpen] = useState(false)
  const [pseudoInput, setPseudoInput] = useState('')
  const [pseudoLoading, setPseudoLoading] = useState(false)
  useEffect(() => {
    if (user && !user.user_metadata?.display_name) setPseudoOpen(true)
  }, [user])
  async function savePseudo() {
    const val = pseudoInput.trim()
    if (!val) return
    setPseudoLoading(true)
    const sb = createClient()
    await sb.auth.updateUser({ data: { display_name: val } })
    setPseudoOpen(false)
    setPseudoLoading(false)
  }

  const [stretchEnabled, setStretchEnabled] = useState(true)
  useEffect(() => {
    setStretchEnabled(localStorage.getItem('gymlog_stretch_enabled') !== 'false')
  }, [])
  function toggleStretch() {
    const next = !stretchEnabled
    setStretchEnabled(next)
    localStorage.setItem('gymlog_stretch_enabled', next ? 'true' : 'false')
  }

  // ── Tab navigation with direction ────────────────────────────
  const goTo = useCallback((newTab: Tab) => {
    setScrubbing(false)
    setDirection(NAV.findIndex(n => n.id === newTab) >= NAV.findIndex(n => n.id === tabRef.current) ? 1 : -1)
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
    let disabled = false

    function shouldSkipSwipe(target: EventTarget | null): boolean {
      if (!(target instanceof Element)) return false
      // Skip when interaction starts on horizontally-draggable controls
      if (target.closest('input[type="range"]')) return true
      if (target.closest('[data-no-swipe]')) return true
      return false
    }

    function onStart(e: TouchEvent) {
      disabled = shouldSkipSwipe(e.target)
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      lock = 'none'
    }

    function onMove(e: TouchEvent) {
      if (disabled) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY

      if (lock === 'none' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        lock = Math.abs(dx) > Math.abs(dy) * 0.75 ? 'h' : 'v'
      }

      // Block vertical scroll while a horizontal swipe is in progress
      if (lock === 'h') e.preventDefault()
    }

    function onEnd(e: TouchEvent) {
      if (disabled) { disabled = false; return }
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

  // ── Nav bar scrubbing — native touch events for iOS ──────────
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    let startX = 0
    let isScrubbing = false

    function onStart(e: TouchEvent) {
      navDragging.current = true
      startX = e.touches[0].clientX
      isScrubbing = false
    }

    function onMove(e: TouchEvent) {
      if (!navDragging.current) return
      // Activate scrubbing only after real horizontal movement
      if (!isScrubbing && Math.abs(e.touches[0].clientX - startX) < 6) return
      e.preventDefault()
      isScrubbing = true
      setScrubbing(true)
      const touch = e.touches[0]
      const rect = nav!.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const idx = Math.min(NAV.length - 1, Math.max(0, Math.floor((x / rect.width) * NAV.length)))
      const hovered = NAV[idx].id
      if (hovered !== tabRef.current) {
        setDirection(NAV.findIndex(n => n.id === hovered) >= NAV.findIndex(n => n.id === tabRef.current) ? 1 : -1)
        setTab(hovered)
      }
    }

    function onEnd() {
      navDragging.current = false
      isScrubbing = false
      setScrubbing(false)
    }

    nav.addEventListener('touchstart', onStart, { passive: true })
    nav.addEventListener('touchmove', onMove, { passive: false })
    nav.addEventListener('touchend', onEnd, { passive: true })
    nav.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      nav.removeEventListener('touchstart', onStart)
      nav.removeEventListener('touchmove', onMove)
      nav.removeEventListener('touchend', onEnd)
      nav.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  const name = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '?'
  const initials = name[0].toUpperCase()
  const Screen = SCREENS[tab]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="sticky top-0 z-50 glass-strong flex items-center justify-between px-5 border-b border-white/[0.06]"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', paddingBottom: '16px' }}
      >
        <div className="flex items-center gap-2">
          <div className="text-xl font-semibold tracking-tight">
            Gym<span className="text-[#A78BFA] drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">Log</span>
          </div>
          {isPro && (
            <span
              className="text-[9px] font-extrabold tracking-[1.4px] text-white px-1.5 py-0.5 rounded-md uppercase"
              style={{
                background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
                boxShadow: '0 0 12px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              Pro
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-500 font-mono">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
          </span>
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 ${isPro ? 'text-white border border-white/20' : 'bg-[#1C1C1C] border border-[#A78BFA] text-[#A78BFA]'}`}
              style={isPro ? { background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', boxShadow: '0 0 14px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.18)' } : undefined}
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
                    onClick={() => {
                      setProfileOpen(false)
                      setPseudoInput(user?.user_metadata?.display_name || '')
                      setPseudoOpen(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] transition-colors border-b border-white/[0.06]"
                  >
                    <Pencil size={16} strokeWidth={1.8} />
                    Modifier le pseudo
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); openPro() }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[#A78BFA] hover:bg-[#A78BFA]/10 transition-colors border-b border-white/[0.06]"
                  >
                    <span className="flex items-center gap-3">
                      <Crown size={16} strokeWidth={1.8} />
                      GymLog Pro
                    </span>
                    {isPro && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                        ACTIF
                      </span>
                    )}
                  </button>
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.06]">
                    <span className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                      <PersonStanding size={16} strokeWidth={1.8} />
                      Étirements post-séance
                    </span>
                    <button
                      onClick={toggleStretch}
                      aria-label="Activer ou désactiver les étirements"
                      className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                      style={{ background: stretchEnabled ? '#7C3AED' : 'rgba(255,255,255,0.12)' }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                        style={{ transform: stretchEnabled ? 'translateX(20px)' : 'translateX(4px)' }}
                      />
                    </button>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => { setProfileOpen(false); setAdminOpen(true) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-colors border-b border-white/[0.06]"
                    >
                      <ShieldCheck size={16} strokeWidth={1.8} />
                      Admin — utilisateurs
                    </button>
                  )}
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
        {scrubbing ? (
          <div className="h-full">
            <Screen />
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={tab}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="glass-strong border-t border-white/[0.06] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
        <div ref={navRef} className="flex">
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

      {/* Pro subscription modal */}
      <AnimatePresence>
        {proOpen && <ProScreen onClose={closePro} />}
      </AnimatePresence>

      {/* Admin modal */}
      <AnimatePresence>
        {adminOpen && <AdminScreen onClose={() => setAdminOpen(false)} />}
      </AnimatePresence>

      {/* Rest timer — only visible on the Séance tab */}
      {tab === 'log' && <RestTimer />}

      {/* Pseudo prompt for Google / OAuth users with no display_name */}
      <AnimatePresence>
        {pseudoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-xl flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-[340px] rounded-3xl p-6 border"
              style={{
                background: 'linear-gradient(180deg,#181818,#111)',
                borderColor: 'rgba(139,92,246,0.25)',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7), 0 0 60px -20px rgba(139,92,246,0.35)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.25),rgba(139,92,246,0.15))', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-[17px] font-semibold text-white text-center tracking-tight mb-1">Choisis ton pseudo</h2>
              <p className="text-sm text-zinc-500 text-center mb-5 leading-relaxed">
                Il apparaîtra sur tes stats et dans le classement.
              </p>
              <input
                type="text"
                placeholder="Pseudo"
                value={pseudoInput}
                onChange={e => setPseudoInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') savePseudo() }}
                autoFocus
                maxLength={24}
                className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] outline-none transition-all mb-3"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={savePseudo}
                disabled={pseudoLoading || !pseudoInput.trim()}
                className="w-full py-3.5 rounded-2xl font-semibold text-[15px] text-white disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -6px rgba(109,40,217,0.5)' }}
              >
                {pseudoLoading ? '…' : 'Valider'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
