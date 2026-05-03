'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('home')
  const { user, signOut } = useApp()
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
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-[#A78BFA] flex items-center justify-center text-[13px] font-semibold text-[#A78BFA] transition-all duration-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95"
            aria-label="Se déconnecter"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Screen */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="glass-strong border-t border-white/[0.06] fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe">
        <div className="flex">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3.5 relative"
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
