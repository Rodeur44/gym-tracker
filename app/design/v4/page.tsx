'use client'

// Direction V4 — « Le Studio » : boutique fitness en MODE CLAIR.
// Seule direction claire du lot : ivoire, terracotta, sauge, coins généreux,
// ombres douces. Le calme d'un studio haut de gamme, pas une app de garage.

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, Check, ArrowUpRight, Timer, Flame, Trophy } from 'lucide-react'
import { NEXT_TYPE, NEXT_TIP, STATS, WEEK, LAST_SESSION, SESSION_EXOS, LIVE } from '../_mock'

const BG = '#F4EFE6'
const CARD = '#FFFDF8'
const INK = '#211B14'
const MUTE = '#8C8272'
const TERRA = '#C4562F'
const SAGE = '#5F7052'
const LINE = '#E5DDCE'
const CREAM = '#FFF6EE'

const club = { fontFamily: 'var(--font-club)' }

function DemoBar({ current }: { current: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px]"
      style={{ background: TERRA, color: CREAM }}>
      <Link href="/design" className="underline underline-offset-2">← Directions</Link>
      <span>{current}</span>
      <span className="flex gap-3">
        <Link href="/design/v1" className="opacity-60">V1</Link>
        <Link href="/design/v2" className="opacity-60">V2</Link>
        <Link href="/design/v3" className="opacity-60">V3</Link>
      </span>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] ${className}`}
      style={{ background: CARD, border: `1px solid ${LINE}`, boxShadow: '0 8px 24px -16px rgba(33,27,20,0.25)' }}>
      {children}
    </div>
  )
}

function HomeV4({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-28">
      <header>
        <p className="text-[13px] font-semibold" style={{ color: MUTE }}>Vendredi 12 juillet</p>
        <h1 className="text-[30px] font-extrabold leading-tight tracking-tight">Bonjour, Enzo</h1>
      </header>

      {/* Hero prochaine séance */}
      <div className="rounded-[28px] p-6" style={{ background: TERRA, color: CREAM }}>
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-80">Aujourd&apos;hui</p>
        <p className="mt-2 text-[28px] font-extrabold leading-tight">Séance {NEXT_TYPE}</p>
        <p className="mt-1 text-[14px] font-medium opacity-80">{NEXT_TIP}</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onStart}
          className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-bold"
          style={{ background: CREAM, color: TERRA }}
        >
          Commencer <ArrowUpRight size={20} strokeWidth={2} />
        </motion.button>
      </div>

      {/* Semaine en pastilles */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold">Cette semaine</p>
          <span className="flex items-center gap-1 text-[13px] font-bold" style={{ color: TERRA }}>
            <Flame size={16} strokeWidth={1.8} /> {STATS.streak} j de suite
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          {WEEK.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold" style={{ color: d.today ? TERRA : MUTE }}>{d.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: d.done ? SAGE : 'transparent',
                  border: d.done ? 'none' : `2px ${d.today ? 'solid' : 'dashed'} ${d.today ? TERRA : LINE}`,
                  color: CREAM,
                }}>
                {d.done && <Check size={16} strokeWidth={2.5} />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(STATS.sessions), l: 'Séances', c: INK },
          { v: STATS.weekVolume, l: 'Volume', c: TERRA },
          { v: String(STATS.cards), l: 'Cartes', c: SAGE },
        ].map(s => (
          <Card key={s.l} className="p-4">
            <p className="text-[19px] font-extrabold leading-none tabular-nums" style={{ color: s.c }}>{s.v}</p>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: MUTE }}>{s.l}</p>
          </Card>
        ))}
      </div>

      {/* Dernière séance */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold">Dernière séance — {LAST_SESSION.type}</p>
          <span className="text-[12px] font-semibold" style={{ color: MUTE }}>{LAST_SESSION.date} · {LAST_SESSION.duration}</span>
        </div>
        <div className="mt-2 flex flex-col">
          {LAST_SESSION.exos.map((e, i) => (
            <div key={e.name} className="flex items-center justify-between py-3"
              style={{ borderTop: i > 0 ? `1px solid ${LINE}` : 'none' }}>
              <span className="text-[14px] font-semibold">{e.name}</span>
              <span className="text-[13px] font-bold tabular-nums" style={{ color: TERRA }}>
                {e.best} <span style={{ color: MUTE }}>· {e.sets}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SeanceV4() {
  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-28">
      {/* Barre de session */}
      <Card className="flex items-center justify-between p-4">
        <span className="flex items-center gap-2 text-[20px] font-extrabold tabular-nums">
          <Timer size={20} strokeWidth={1.8} style={{ color: TERRA }} /> {LIVE.elapsed}
        </span>
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: MUTE }}>{LIVE.volume}</span>
        <span className="text-[13px] font-bold tabular-nums" style={{ color: SAGE }}>{LIVE.setsDone}/{LIVE.setsTotal} séries</span>
      </Card>

      <h1 className="px-1 text-[26px] font-extrabold tracking-tight">Séance {NEXT_TYPE}</h1>

      {SESSION_EXOS.map((exo, xi) => {
        const current = xi === 1
        return (
          <Card key={xi} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold tracking-tight" style={{ color: current ? INK : MUTE }}>{exo.name}</h2>
                <p className="mt-1 text-[12px] font-semibold" style={{ color: MUTE }}>
                  Dernière {exo.last} → <span style={{ color: SAGE }}>cible {exo.target}</span>
                </p>
              </div>
              {exo.pr && (
                <span className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold"
                  style={{ background: '#F3E3D3', color: '#9C6B3F' }}>
                  <Trophy size={13} strokeWidth={2} /> Record en vue
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {exo.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-3 rounded-[18px] px-4 py-2.5"
                  style={{ background: s.done ? `${SAGE}14` : BG, border: `1px solid ${s.done ? `${SAGE}55` : LINE}` }}>
                  <span className="w-4 text-[11px] font-bold" style={{ color: MUTE }}>{si + 1}</span>
                  <span className="flex-1 text-[16px] font-extrabold tabular-nums">
                    {s.weight} <span className="text-[11px] font-semibold" style={{ color: MUTE }}>kg</span>
                    <span className="mx-1.5" style={{ color: MUTE }}>×</span>{s.reps}
                  </span>
                  {s.done && si === 1 && (
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums"
                      style={{ background: '#EAD9C6', color: '#9C6B3F' }}>
                      Repos {LIVE.rest}
                    </span>
                  )}
                  <button
                    aria-label={s.done ? 'Série faite' : 'Marquer la série faite'}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: s.done ? SAGE : 'transparent', border: s.done ? 'none' : `2px solid ${LINE}`, color: CREAM }}
                  >
                    {s.done && <Check size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              ))}
              <button className="min-h-[44px] rounded-[18px] text-[12px] font-bold"
                style={{ border: `1px dashed ${LINE}`, color: MUTE }}>
                + Série
              </button>
            </div>
          </Card>
        )
      })}

      <button className="flex min-h-[56px] w-full items-center justify-center rounded-full text-[16px] font-bold"
        style={{ background: INK, color: CARD }}>
        Terminer la séance
      </button>
    </div>
  )
}

const NAV = [
  { id: 'history', label: 'Historique', icon: Clock },
  { id: 'seance', label: 'Séance', icon: Plus },
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'prog', label: 'Progrès', icon: BarChart2 },
  { id: 'cards', label: 'Cartes', icon: LayoutGrid },
]

export default function DesignV4() {
  const [tab, setTab] = useState<'home' | 'seance'>('home')

  return (
    <div className="relative min-h-screen" style={{ background: BG, color: INK, ...club }}>
      <DemoBar current="V4 — Le Studio" />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'home' ? <HomeV4 onStart={() => setTab('seance')} /> : <SeanceV4 />}
        </motion.div>
      </AnimatePresence>

      {/* Nav basse */}
      <nav className="fixed bottom-0 left-1/2 z-50 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5"
        style={{ background: CARD, borderTop: `1px solid ${LINE}` }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = (id === 'home' && tab === 'home') || (id === 'seance' && tab === 'seance')
          return (
            <button
              key={id}
              aria-label={label}
              onClick={() => (id === 'home' || id === 'seance') && setTab(id as 'home' | 'seance')}
              className="flex flex-col items-center gap-1 pt-3"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', color: active ? TERRA : MUTE }}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.8} />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
