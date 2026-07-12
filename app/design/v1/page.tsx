'use client'

// Direction V1 — « L'Affiche » : poster athlétique.
// Encre + volt, typo écrasante, traits durs, zéro flou, zéro dégradé.
// L'énergie d'une affiche de salle de boxe, pas d'une app IA.

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, Check, ArrowRight, Timer, Flame } from 'lucide-react'
import { NEXT_TYPE, STATS, WEEK, LAST_SESSION, SESSION_EXOS, LIVE } from '../_mock'

const INK = '#0D0D0F'
const PAPER = '#F4F2EC'
const VOLT = '#D8FF3A'
const MUTE = '#77776F'

function DemoBar({ current }: { current: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px]"
      style={{ background: VOLT, color: INK }}>
      <Link href="/design" className="underline underline-offset-2">← Directions</Link>
      <span>{current}</span>
      <span className="flex gap-3">
        <Link href="/design/v2" className="opacity-60">V2</Link>
        <Link href="/design/v3" className="opacity-60">V3</Link>
      </span>
    </div>
  )
}

function HomeV1({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col">
      {/* En-tête */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4 border-b-2" style={{ borderColor: PAPER }}>
        <span className="text-[22px] leading-none" style={{ fontFamily: 'var(--font-poster)' }}>
          GYM<span style={{ color: VOLT }}>LOG</span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[1.5px]" style={{ color: MUTE }}>
          Ven 12 juil — Nº{STATS.sessions + 1}
        </span>
      </header>

      {/* Affiche : prochaine séance */}
      <section className="px-5 pt-6 pb-5 border-b-2" style={{ borderColor: PAPER }}>
        <p className="text-[11px] font-bold uppercase tracking-[2px] mb-2" style={{ color: MUTE }}>
          Prochaine séance
        </p>
        <h1 className="uppercase leading-[0.85]" style={{ fontFamily: 'var(--font-poster)', fontSize: 84, letterSpacing: '-2px' }}>
          {NEXT_TYPE}<span style={{ color: VOLT }}>.</span>
        </h1>
        <p className="text-[13px] font-semibold mt-3" style={{ color: MUTE }}>
          Dernière : 8 juil. — vise <span style={{ color: PAPER }}>92,5 kg</span> au rowing barre
        </p>
        <motion.button
          whileTap={{ scale: 0.98, x: 2, y: 2 }}
          onClick={onStart}
          className="mt-5 w-full flex items-center justify-between px-5 py-4 text-[17px] font-black uppercase tracking-wide"
          style={{ background: VOLT, color: INK, boxShadow: `5px 5px 0 ${PAPER}`, fontFamily: 'var(--font-poster-text)' }}
        >
          Démarrer la séance
          <ArrowRight size={24} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Semaine — barres */}
      <section className="px-5 py-5 border-b-2" style={{ borderColor: PAPER }}>
        <div className="flex items-end justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: MUTE }}>Cette semaine</p>
          <p className="text-[11px] font-black uppercase tracking-[1px] flex items-center gap-1" style={{ color: VOLT }}>
            <Flame size={12} strokeWidth={2.5} /> {STATS.streak} jours de suite
          </p>
        </div>
        <div className="flex gap-1.5 items-end h-16">
          {WEEK.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full border-2" style={{
                height: d.done ? '100%' : 14,
                background: d.done ? VOLT : 'transparent',
                borderColor: d.done ? VOLT : d.today ? PAPER : '#2A2A2C',
              }} />
              <span className="text-[10px] font-black" style={{ color: d.today ? PAPER : MUTE }}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bande de stats */}
      <section className="grid grid-cols-3 border-b-2" style={{ borderColor: PAPER }}>
        {[
          { v: String(STATS.sessions), l: 'Séances' },
          { v: STATS.weekVolume, l: 'Volume / sem' },
          { v: String(STATS.cards), l: 'Cartes' },
        ].map((s, i) => (
          <div key={i} className="py-4 px-3 text-center" style={{ borderLeft: i > 0 ? `2px solid ${PAPER}22` : 'none' }}>
            <div className="text-[24px] leading-none" style={{ fontFamily: 'var(--font-poster)' }}>{s.v}</div>
            <div className="text-[9px] font-bold uppercase tracking-[1.5px] mt-1.5" style={{ color: MUTE }}>{s.l}</div>
          </div>
        ))}
      </section>

      {/* Dernière séance */}
      <section className="px-5 py-5 pb-28">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: MUTE }}>La dernière</p>
          <p className="text-[11px] font-bold uppercase tracking-[1px]" style={{ color: MUTE }}>
            {LAST_SESSION.type} · {LAST_SESSION.date} · {LAST_SESSION.duration} · <span style={{ color: PAPER }}>{LAST_SESSION.volume}</span>
          </p>
        </div>
        <div className="border-2" style={{ borderColor: PAPER }}>
          {LAST_SESSION.exos.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: i > 0 ? `2px solid ${PAPER}22` : 'none' }}>
              <span className="text-[14px] font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-poster-text)' }}>{e.name}</span>
              <span className="text-[13px] font-black tabular-nums flex-shrink-0" style={{ color: VOLT }}>
                {e.best} <span style={{ color: MUTE }}>· {e.sets}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SeanceV1() {
  return (
    <div className="flex flex-col">
      {/* Barre de session collante */}
      <div className="sticky top-0 z-40 flex items-stretch border-b-2" style={{ background: INK, borderColor: PAPER }}>
        <div className="flex-1 flex items-center gap-4 px-4 py-3">
          <span className="flex items-center gap-1.5 text-[15px] font-black tabular-nums">
            <Timer size={15} strokeWidth={2.5} style={{ color: VOLT }} /> {LIVE.elapsed}
          </span>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: MUTE }}>{LIVE.volume}</span>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: MUTE }}>{LIVE.setsDone}/{LIVE.setsTotal} séries</span>
        </div>
        <button className="px-4 text-[12px] font-black uppercase tracking-[1px]" style={{ background: VOLT, color: INK }}>
          Terminer
        </button>
      </div>

      <div className="px-5 pt-5 pb-28 flex flex-col gap-6">
        <h1 className="uppercase leading-[0.85]" style={{ fontFamily: 'var(--font-poster)', fontSize: 44, letterSpacing: '-1px' }}>
          Séance dos<span style={{ color: VOLT }}>.</span>
        </h1>

        {SESSION_EXOS.map((exo, xi) => (
          <div key={xi}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[17px] font-black uppercase tracking-wide" style={{ fontFamily: 'var(--font-poster-text)' }}>
                {exo.name}
              </h2>
              {exo.pr && (
                <span className="text-[10px] font-black uppercase tracking-[1px] px-2 py-1 -rotate-2"
                  style={{ background: VOLT, color: INK }}>
                  Record en vue
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[1px] mb-2" style={{ color: MUTE }}>
              Dernière {exo.last} → vise <span style={{ color: PAPER }}>{exo.target}</span>
            </p>
            <div className="border-2" style={{ borderColor: PAPER }}>
              {exo.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderTop: si > 0 ? `2px solid ${PAPER}22` : 'none',
                    background: s.done ? `${VOLT}14` : 'transparent',
                  }}>
                  <span className="text-[11px] font-black w-5" style={{ color: MUTE }}>{si + 1}</span>
                  <span className="text-[22px] font-black tabular-nums leading-none flex-1" style={{ fontFamily: 'var(--font-poster-text)' }}>
                    {s.weight} <span className="text-[12px]" style={{ color: MUTE }}>KG</span>
                    <span className="mx-2" style={{ color: MUTE }}>×</span>{s.reps}
                  </span>
                  {s.done && si === 1 && (
                    <span className="text-[11px] font-black tabular-nums px-2 py-1 border-2" style={{ borderColor: VOLT, color: VOLT }}>
                      REPOS {LIVE.rest}
                    </span>
                  )}
                  <button
                    aria-label={s.done ? 'Série faite' : 'Marquer la série faite'}
                    className="w-9 h-9 border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: s.done ? VOLT : `${PAPER}44`, background: s.done ? VOLT : 'transparent', color: INK }}
                  >
                    {s.done && <Check size={18} strokeWidth={3} />}
                  </button>
                </div>
              ))}
              <button className="w-full py-3 text-[12px] font-black uppercase tracking-[1.5px]"
                style={{ borderTop: `2px dashed ${PAPER}33`, color: MUTE }}>
                + Série
              </button>
            </div>
          </div>
        ))}

        <button className="w-full py-4 border-2 border-dashed text-[13px] font-black uppercase tracking-[1.5px]"
          style={{ borderColor: `${PAPER}44`, color: MUTE }}>
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

export default function DesignV1() {
  const [tab, setTab] = useState<'home' | 'seance'>('home')

  return (
    <div className="min-h-screen relative" style={{ background: INK, color: PAPER, fontFamily: 'var(--font-poster-text)' }}>
      <DemoBar current="V1 — L'Affiche" />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'home' ? <HomeV1 onStart={() => setTab('seance')} /> : <SeanceV1 />}
        </motion.div>
      </AnimatePresence>

      {/* Nav basse */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 border-t-2 grid grid-cols-5"
        style={{ background: INK, borderColor: PAPER }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = (id === 'home' && tab === 'home') || (id === 'seance' && tab === 'seance')
          return (
            <button
              key={id}
              aria-label={label}
              onClick={() => (id === 'home' || id === 'seance') && setTab(id as 'home' | 'seance')}
              className="flex flex-col items-center gap-1 pt-3"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', background: active ? VOLT : 'transparent', color: active ? INK : MUTE }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-black uppercase tracking-[0.5px]">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
