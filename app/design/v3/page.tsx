'use client'

// Direction V3 — « Le Club » : chaleureux et gamifié.
// Tons chauds, cartes rebondies à bordure franche, carte de membre, XP,
// tampons de présence. L'app d'un club dont on est fier d'être membre —
// à l'opposé du dark tech froid.

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, Check, Flame, ArrowRight, Timer, Star } from 'lucide-react'
import { NEXT_TYPE, STATS, WEEK, LAST_SESSION, SESSION_EXOS, LIVE } from '../_mock'

const BG = '#1A1512'
const CARD = '#241D17'
const CREAM = '#F4EAD9'
const MUTE = '#9C8A76'
const LINE = '#3A2F26'
const ORANGE = '#FF8A3D'
const GOLD = '#FFC24B'
const GREEN = '#8FBF6F'
const CLUB = 'var(--font-club)'

function DemoBar({ current }: { current: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold"
      style={{ background: ORANGE, color: '#231409', fontFamily: CLUB }}>
      <Link href="/design" className="underline underline-offset-2">← Directions</Link>
      <span>{current}</span>
      <span className="flex gap-3">
        <Link href="/design/v1" className="opacity-60">V1</Link>
        <Link href="/design/v2" className="opacity-60">V2</Link>
      </span>
    </div>
  )
}

function ClubCard({ children, accent, className = '' }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div className={`rounded-3xl overflow-hidden ${className}`}
      style={{ background: CARD, border: `2px solid ${accent ?? LINE}` }}>
      {children}
    </div>
  )
}

function HomeV3({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28" style={{ fontFamily: CLUB }}>
      {/* En-tête */}
      <header className="flex items-center justify-between px-1 pt-1">
        <span className="text-[20px] font-extrabold tracking-tight">
          GymLog<span style={{ color: ORANGE }}>.</span>
        </span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-extrabold"
          style={{ background: ORANGE, color: '#231409', border: `2px solid ${GOLD}` }}>
          E
        </div>
      </header>

      {/* Carte de membre */}
      <ClubCard accent={ORANGE}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: `2px dashed ${LINE}` }}>
          <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: MUTE }}>Carte de membre</span>
          <span className="flex items-center gap-1 text-[12px] font-extrabold" style={{ color: GOLD }}>
            <Star size={13} strokeWidth={2.5} fill={GOLD} /> Niveau {STATS.level}
          </span>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] font-semibold" style={{ color: MUTE }}>Enzo — membre depuis avril</p>
          <div className="flex items-end justify-between mt-2 mb-2">
            <span className="text-[30px] font-extrabold leading-none">{STATS.sessions} séances</span>
            <span className="flex items-center gap-1 text-[14px] font-extrabold" style={{ color: ORANGE }}>
              <Flame size={16} strokeWidth={2.5} /> {STATS.streak} j
            </span>
          </div>
          {/* Barre d'XP */}
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#141414', border: `1px solid ${LINE}` }}>
            <div className="h-full rounded-full" style={{ width: `${STATS.xp}%`, background: `linear-gradient(90deg, ${ORANGE}, ${GOLD})` }} />
          </div>
          <p className="text-[11px] font-semibold mt-1.5" style={{ color: MUTE }}>
            {STATS.xp}% vers le niveau {STATS.level + 1} — une séance = +12%
          </p>
        </div>
      </ClubCard>

      {/* Prochaine séance */}
      <ClubCard>
        <div className="px-5 pt-5 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: MUTE }}>Au programme aujourd'hui</p>
          <h1 className="text-[40px] font-extrabold leading-none tracking-tight mb-2">{NEXT_TYPE}</h1>
          <p className="text-[13px] font-semibold leading-relaxed" style={{ color: MUTE }}>
            Le rowing t'attend : <span style={{ color: CREAM }}>92,5 kg</span>, record à battre
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onStart}
            className="mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[16px] font-extrabold"
            style={{ background: ORANGE, color: '#231409', boxShadow: '0 5px 0 #B3521A' }}
          >
            C'est parti
            <ArrowRight size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </ClubCard>

      {/* Tampons de la semaine */}
      <ClubCard>
        <div className="px-5 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: MUTE }}>Ta semaine</p>
            <p className="text-[11px] font-extrabold" style={{ color: GREEN }}>3 / 4 — encore une !</p>
          </div>
          <div className="flex justify-between">
            {WEEK.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: d.done ? GREEN : 'transparent',
                    border: d.done ? `2px solid ${GREEN}` : `2px ${d.today ? 'solid' : 'dashed'} ${d.today ? ORANGE : LINE}`,
                    transform: d.done ? `rotate(${(i % 3 - 1) * 8}deg)` : 'none',
                  }}>
                  {d.done && <Check size={16} strokeWidth={3} color="#1A2412" />}
                </div>
                <span className="text-[10px] font-bold" style={{ color: d.today ? ORANGE : MUTE }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ClubCard>

      {/* Dernière séance */}
      <ClubCard>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between" style={{ borderBottom: `2px dashed ${LINE}` }}>
          <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: MUTE }}>Ta dernière — {LAST_SESSION.type}</span>
          <span className="text-[11px] font-bold" style={{ color: MUTE }}>{LAST_SESSION.date} · {LAST_SESSION.volume}</span>
        </div>
        <div className="px-5 py-2">
          {LAST_SESSION.exos.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-2.5"
              style={{ borderTop: i > 0 ? `1px solid ${LINE}` : 'none' }}>
              <span className="text-[14px] font-semibold">{e.name}</span>
              <span className="text-[13px] font-extrabold" style={{ color: ORANGE }}>
                {e.best} <span className="font-semibold" style={{ color: MUTE }}>· {e.sets}</span>
              </span>
            </div>
          ))}
        </div>
      </ClubCard>
    </div>
  )
}

function SeanceV3() {
  return (
    <div className="flex flex-col" style={{ fontFamily: CLUB }}>
      {/* Barre de session */}
      <div className="sticky top-0 z-40 px-4 py-3" style={{ background: BG }}>
        <div className="rounded-2xl flex items-stretch overflow-hidden" style={{ background: CARD, border: `2px solid ${ORANGE}` }}>
          <div className="flex-1 flex items-center gap-4 px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[15px] font-extrabold tabular-nums">
              <Timer size={15} strokeWidth={2.5} style={{ color: ORANGE }} /> {LIVE.elapsed}
            </span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: MUTE }}>{LIVE.volume}</span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: MUTE }}>{LIVE.setsDone}/{LIVE.setsTotal}</span>
          </div>
          <button className="px-4 text-[13px] font-extrabold" style={{ background: ORANGE, color: '#231409' }}>
            Fini !
          </button>
        </div>
      </div>

      <div className="px-4 pt-2 pb-28 flex flex-col gap-4">
        <h1 className="text-[30px] font-extrabold tracking-tight px-1">Séance dos</h1>

        {SESSION_EXOS.map((exo, xi) => (
          <ClubCard key={xi} accent={exo.pr ? GOLD : undefined}>
            <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-2" style={{ borderBottom: `2px dashed ${LINE}` }}>
              <div>
                <h2 className="text-[17px] font-extrabold tracking-tight">{exo.name}</h2>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: MUTE }}>
                  Dernière {exo.last} → vise <span style={{ color: ORANGE }}>{exo.target}</span>
                </p>
              </div>
              {exo.pr && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-1 rounded-full flex-shrink-0 -rotate-2"
                  style={{ background: GOLD, color: '#231409' }}>
                  <Star size={11} strokeWidth={2.5} fill="#231409" /> Record
                </span>
              )}
            </div>
            <div className="px-5 py-1">
              {exo.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-3 py-3"
                  style={{ borderTop: si > 0 ? `1px solid ${LINE}` : 'none' }}>
                  <span className="text-[11px] font-extrabold w-5" style={{ color: MUTE }}>{si + 1}</span>
                  <span className="text-[19px] font-extrabold tabular-nums flex-1" style={{ color: s.done ? MUTE : CREAM, textDecoration: s.done ? 'line-through' : 'none', textDecorationColor: `${GREEN}88` }}>
                    {s.weight} <span className="text-[11px] font-bold" style={{ color: MUTE }}>kg</span>
                    <span className="mx-1.5 font-bold" style={{ color: MUTE }}>×</span>{s.reps}
                  </span>
                  {s.done && si === 1 && (
                    <span className="text-[11px] font-extrabold tabular-nums px-2.5 py-1 rounded-full" style={{ background: `${GREEN}22`, color: GREEN }}>
                      repos {LIVE.rest}
                    </span>
                  )}
                  <button
                    aria-label={s.done ? 'Série faite' : 'Marquer la série faite'}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: s.done ? GREEN : 'transparent',
                      border: s.done ? `2px solid ${GREEN}` : `2px solid ${LINE}`,
                      transform: s.done ? 'rotate(-4deg)' : 'none',
                    }}>
                    {s.done && <Check size={17} strokeWidth={3} color="#1A2412" />}
                  </button>
                </div>
              ))}
              <button className="w-full py-3 text-[12px] font-extrabold uppercase tracking-[1px]"
                style={{ borderTop: `2px dashed ${LINE}`, color: MUTE }}>
                + une série
              </button>
            </div>
          </ClubCard>
        ))}

        <button className="w-full py-4 rounded-3xl text-[14px] font-extrabold"
          style={{ border: `2px dashed ${LINE}`, color: MUTE }}>
          + Ajouter un exercice
        </button>
      </div>
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

export default function DesignV3() {
  const [tab, setTab] = useState<'home' | 'seance'>('home')

  return (
    <div className="min-h-screen relative" style={{ background: BG, color: CREAM }}>
      <DemoBar current="V3 — Le Club" />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, scale: 0.985, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.99, y: -4 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'home' ? <HomeV3 onStart={() => setTab('seance')} /> : <SeanceV3 />}
        </motion.div>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 grid grid-cols-5"
        style={{ background: BG, borderTop: `2px solid ${LINE}`, fontFamily: CLUB }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = (id === 'home' && tab === 'home') || (id === 'seance' && tab === 'seance')
          return (
            <button
              key={id}
              aria-label={label}
              onClick={() => (id === 'home' || id === 'seance') && setTab(id as 'home' | 'seance')}
              className="flex flex-col items-center gap-1 pt-3"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', color: active ? ORANGE : MUTE }}
            >
              <div className="w-9 h-7 rounded-full flex items-center justify-center"
                style={{ background: active ? `${ORANGE}22` : 'transparent' }}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              </div>
              <span className="text-[9px] font-bold">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
