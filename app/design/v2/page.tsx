'use client'

// Direction V2 — « L'Instrument » : outil de précision.
// Noir OLED, filets d'un pixel, chiffres mono tabulaires, anneaux de
// progression façon montre de sport. Le violet reste, mais au compte-goutte :
// il ne décore plus, il signale.

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Clock, BarChart2, LayoutGrid, Check, Timer, ChevronRight } from 'lucide-react'
import { NEXT_TYPE, STATS, WEEK, LAST_SESSION, SESSION_EXOS, LIVE } from '../_mock'

const BG = '#000000'
const TXT = '#EDEDEF'
const MUTE = '#5B5B60'
const LINE = 'rgba(255,255,255,0.09)'
const VIOLET = '#A78BFA'
const GREEN = '#4ADE80'
const MONO = 'var(--font-instrument-mono)'

function DemoBar({ current }: { current: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-[10px] font-semibold uppercase tracking-[2px]"
      style={{ background: '#111114', color: MUTE, borderBottom: `1px solid ${LINE}` }}>
      <Link href="/design" style={{ color: VIOLET }}>← Directions</Link>
      <span style={{ color: TXT }}>{current}</span>
      <span className="flex gap-3">
        <Link href="/design/v1">V1</Link>
        <Link href="/design/v3">V3</Link>
      </span>
    </div>
  )
}

function Ring({ pct, size = 92, stroke = 5, color = VIOLET, children }: {
  pct: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold uppercase tracking-[2px]" style={{ color: MUTE }}>{children}</p>
}

function HomeV2({ onStart }: { onStart: () => void }) {
  const weekDone = WEEK.filter(d => d.done).length
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <span className="text-[17px] font-semibold tracking-tight">
          Gym<span style={{ color: VIOLET }}>Log</span>
        </span>
        <span className="text-[11px] tabular-nums" style={{ fontFamily: MONO, color: MUTE }}>ven 12 juil</span>
      </header>

      {/* Panneau principal : anneau de semaine + prochaine séance */}
      <section className="px-5 py-6 flex items-center gap-6" style={{ borderBottom: `1px solid ${LINE}` }}>
        <Ring pct={weekDone / 4}>
          <span className="text-[22px] font-semibold tabular-nums leading-none" style={{ fontFamily: MONO }}>{weekDone}<span style={{ color: MUTE }}>/4</span></span>
          <span className="text-[8px] font-semibold uppercase tracking-[1.5px] mt-1" style={{ color: MUTE }}>séances</span>
        </Ring>
        <div className="flex-1 min-w-0">
          <Label>Prochaine séance</Label>
          <h1 className="text-[34px] font-semibold tracking-tight leading-none mt-1.5 mb-2">{NEXT_TYPE}</h1>
          <p className="text-[12px] leading-relaxed" style={{ color: MUTE }}>
            Cible : <span style={{ color: TXT, fontFamily: MONO }}>92,5 kg</span> au rowing barre
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full h-13 py-4 rounded-full flex items-center justify-center gap-2 text-[14px] font-semibold"
          style={{ background: VIOLET, color: '#0A0A0A' }}
        >
          Démarrer — {NEXT_TYPE}
          <ChevronRight size={16} strokeWidth={2.5} />
        </motion.button>
      </section>

      {/* Semaine en ticks */}
      <section className="px-5 py-5" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center justify-between mb-4">
          <Label>Semaine 28</Label>
          <span className="text-[11px] tabular-nums" style={{ fontFamily: MONO, color: MUTE }}>
            volume <span style={{ color: TXT }}>{STATS.weekVolume}</span>
          </span>
        </div>
        <div className="flex justify-between">
          {WEEK.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  border: d.done ? 'none' : `1px solid ${d.today ? VIOLET : LINE}`,
                  background: d.done ? VIOLET : 'transparent',
                }}>
                {d.done && <Check size={13} strokeWidth={3} color="#0A0A0A" />}
              </div>
              <span className="text-[9px] font-semibold uppercase" style={{ color: d.today ? VIOLET : MUTE, fontFamily: MONO }}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mesures */}
      <section className="px-5" style={{ borderBottom: `1px solid ${LINE}` }}>
        {[
          { l: 'Séances totales', v: '47' },
          { l: 'Série en cours', v: '3 jours' },
          { l: 'Cartes débloquées', v: '12 / 24' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between py-3.5"
            style={{ borderTop: i > 0 ? `1px solid ${LINE}` : 'none' }}>
            <span className="text-[13px]" style={{ color: MUTE }}>{row.l}</span>
            <span className="text-[13px] font-medium tabular-nums" style={{ fontFamily: MONO }}>{row.v}</span>
          </div>
        ))}
      </section>

      {/* Dernière séance */}
      <section className="px-5 py-5 pb-28">
        <div className="flex items-center justify-between mb-3">
          <Label>Dernière séance — {LAST_SESSION.type}</Label>
          <span className="text-[10px] tabular-nums" style={{ fontFamily: MONO, color: MUTE }}>
            {LAST_SESSION.date} · {LAST_SESSION.duration} · {LAST_SESSION.volume}
          </span>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
          {LAST_SESSION.exos.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: i > 0 ? `1px solid ${LINE}` : 'none' }}>
              <span className="text-[13px]">{e.name}</span>
              <span className="text-[12px] tabular-nums" style={{ fontFamily: MONO, color: MUTE }}>
                <span style={{ color: VIOLET }}>{e.best}</span> · {e.sets}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SeanceV2() {
  const pct = LIVE.setsDone / LIVE.setsTotal
  return (
    <div className="flex flex-col">
      {/* Instruments de session */}
      <div className="sticky top-0 z-40 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 px-5 py-3"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${LINE}` }}>
        <div>
          <Label>Durée</Label>
          <span className="text-[15px] font-medium tabular-nums" style={{ fontFamily: MONO }}>{LIVE.elapsed}</span>
        </div>
        <div>
          <Label>Volume</Label>
          <span className="text-[15px] font-medium tabular-nums" style={{ fontFamily: MONO }}>{LIVE.volume}</span>
        </div>
        <div>
          <Label>Séries</Label>
          <span className="text-[15px] font-medium tabular-nums" style={{ fontFamily: MONO }}>
            <span style={{ color: VIOLET }}>{LIVE.setsDone}</span>/{LIVE.setsTotal}
          </span>
        </div>
        <Ring pct={pct} size={40} stroke={3.5}>
          <Timer size={14} strokeWidth={2} color={MUTE} />
        </Ring>
      </div>

      <div className="px-5 pt-5 pb-28 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-semibold tracking-tight">Séance dos</h1>
          <button className="text-[12px] font-semibold px-4 py-2 rounded-full"
            style={{ border: `1px solid ${VIOLET}55`, color: VIOLET }}>
            Terminer
          </button>
        </div>

        {SESSION_EXOS.map((exo, xi) => (
          <div key={xi} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
            <div className="px-4 pt-3.5 pb-3 flex items-start justify-between gap-2" style={{ borderBottom: `1px solid ${LINE}` }}>
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight">{exo.name}</h2>
                <p className="text-[11px] mt-1 tabular-nums" style={{ color: MUTE, fontFamily: MONO }}>
                  {exo.last} → <span style={{ color: VIOLET }}>{exo.target}</span>
                </p>
              </div>
              {exo.pr && (
                <span className="text-[9px] font-semibold uppercase tracking-[1.5px] px-2 py-1 rounded-full flex-shrink-0"
                  style={{ border: `1px solid ${VIOLET}55`, color: VIOLET }}>
                  Record en vue
                </span>
              )}
            </div>
            {exo.sets.map((s, si) => (
              <div key={si} className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: si > 0 ? `1px solid ${LINE}` : 'none', opacity: s.done ? 0.55 : 1 }}>
                <span className="text-[10px] tabular-nums w-4" style={{ fontFamily: MONO, color: MUTE }}>{si + 1}</span>
                <span className="text-[17px] font-medium tabular-nums flex-1" style={{ fontFamily: MONO }}>
                  {s.weight}<span className="text-[10px] ml-0.5" style={{ color: MUTE }}>kg</span>
                  <span className="mx-2" style={{ color: MUTE }}>×</span>{s.reps}
                </span>
                {s.done && si === 1 && (
                  <span className="text-[11px] tabular-nums px-2.5 py-1 rounded-full" style={{ fontFamily: MONO, border: `1px solid ${GREEN}44`, color: GREEN }}>
                    repos {LIVE.rest}
                  </span>
                )}
                <button
                  aria-label={s.done ? 'Série faite' : 'Marquer la série faite'}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: s.done ? 'none' : `1px solid rgba(255,255,255,0.18)`,
                    background: s.done ? GREEN : 'transparent',
                  }}>
                  {s.done && <Check size={15} strokeWidth={3} color="#0A0A0A" />}
                </button>
              </div>
            ))}
            <button className="w-full py-2.5 text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ borderTop: `1px dashed ${LINE}`, color: MUTE }}>
              + série
            </button>
          </div>
        ))}

        <button className="w-full py-4 rounded-2xl text-[12px] font-semibold uppercase tracking-[1.5px]"
          style={{ border: `1px dashed rgba(255,255,255,0.16)`, color: MUTE }}>
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

export default function DesignV2() {
  const [tab, setTab] = useState<'home' | 'seance'>('home')

  return (
    <div className="min-h-screen relative" style={{ background: BG, color: TXT }}>
      <DemoBar current="V2 — L'Instrument" />
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === 'home' ? <HomeV2 onStart={() => setTab('seance')} /> : <SeanceV2 />}
        </motion.div>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 grid grid-cols-5"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${LINE}` }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = (id === 'home' && tab === 'home') || (id === 'seance' && tab === 'seance')
          return (
            <button
              key={id}
              aria-label={label}
              onClick={() => (id === 'home' || id === 'seance') && setTab(id as 'home' | 'seance')}
              className="flex flex-col items-center gap-1 pt-3"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))', color: active ? VIOLET : MUTE }}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.8} />
              <span className="text-[9px] font-medium tracking-wide">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
