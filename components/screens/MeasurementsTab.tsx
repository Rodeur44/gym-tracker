'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Plus, Ruler, Scale, TrendingUp, TrendingDown, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import type { Measurement, MeasurementInput } from '@/types'

const stagger: Variants = { animate: { transition: { staggerChildren: 0.07 } } }
const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const FIELDS: { key: keyof MeasurementInput; label: string; unit: string; group: 'mass' | 'torso' | 'arms' | 'legs' }[] = [
  { key: 'weight', label: 'Poids', unit: 'kg', group: 'mass' },
  { key: 'body_fat', label: '% MG', unit: '%', group: 'mass' },
  { key: 'chest', label: 'Pec', unit: 'cm', group: 'torso' },
  { key: 'waist', label: 'Taille', unit: 'cm', group: 'torso' },
  { key: 'hips', label: 'Hanches', unit: 'cm', group: 'torso' },
  { key: 'arm_left', label: 'Bras G', unit: 'cm', group: 'arms' },
  { key: 'arm_right', label: 'Bras D', unit: 'cm', group: 'arms' },
  { key: 'thigh_left', label: 'Cuisse G', unit: 'cm', group: 'legs' },
  { key: 'thigh_right', label: 'Cuisse D', unit: 'cm', group: 'legs' },
]

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtShortDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

// ── Weight chart (line graph over time) ────────────────────────────
function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center text-xs text-zinc-600">
        {data.length === 0 ? 'Aucune donnée de poids' : 'Ajoute une 2e mesure pour voir la courbe'}
      </div>
    )
  }

  const W = 320
  const H = 100
  const PX = 6
  const PY = 16

  const weights = data.map(d => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = (maxW - minW) || 1

  const pts = data.map((d, i) => ({
    x: +(PX + (i / (data.length - 1)) * (W - 2 * PX)).toFixed(1),
    y: +(PY + (1 - (d.weight - minW) / range) * (H - 2 * PY)).toFixed(1),
    weight: d.weight,
    date: d.date,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`
  const last = pts[pts.length - 1]
  const first = pts[0]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      <defs>
        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#weightGrad)" />
      <path d={linePath} stroke="#A78BFA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 2.5} fill="#A78BFA" opacity={i === pts.length - 1 ? 1 : 0.55} />
      ))}
      <text x={last.x} y={last.y - 8} textAnchor="middle" fill="#A78BFA" fontSize="9" fontFamily="monospace" fontWeight="bold">
        {last.weight}kg
      </text>
      <text x={first.x} y={H - 3} textAnchor="start" fill="#525252" fontSize="8" fontFamily="monospace">
        {fmtShortDate(first.date)}
      </text>
      <text x={last.x} y={H - 3} textAnchor="end" fill="#525252" fontSize="8" fontFamily="monospace">
        {fmtShortDate(last.date)}
      </text>
    </svg>
  )
}

// ── Add/Edit measurement sheet ──────────────────────────────────────
function MeasurementSheet({
  initial, onClose, onSubmit, onDelete,
}: {
  initial: Measurement | null
  onClose: () => void
  onSubmit: (payload: MeasurementInput) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(initial?.date ?? today)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {}
    FIELDS.forEach(f => {
      const x = initial?.[f.key]
      v[f.key as string] = x != null ? String(x) : ''
    })
    return v
  })
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function setField(k: string, v: string) {
    // Allow only digits + optional dot/comma; convert comma to dot
    const cleaned = v.replace(',', '.').replace(/[^0-9.]/g, '')
    // Avoid double dots
    const parts = cleaned.split('.')
    const final = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned
    setValues(p => ({ ...p, [k]: final }))
  }

  async function submit() {
    if (saving) return
    const payload: MeasurementInput = {
      date,
      weight: parseNum(values.weight),
      body_fat: parseNum(values.body_fat),
      chest: parseNum(values.chest),
      waist: parseNum(values.waist),
      hips: parseNum(values.hips),
      arm_left: parseNum(values.arm_left),
      arm_right: parseNum(values.arm_right),
      thigh_left: parseNum(values.thigh_left),
      thigh_right: parseNum(values.thigh_right),
      notes: notes.trim() || null,
    }
    setSaving(true)
    await onSubmit(payload)
    setSaving(false)
  }

  function parseNum(s: string): number | null {
    if (!s) return null
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-3xl pt-3 pb-6 border-t border-white/[0.08] flex flex-col max-h-[92vh]"
        style={{
          background: '#141414',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="w-12 h-1 rounded-full bg-white/15 mx-auto mb-3" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.6px]">
              {initial ? 'Modifier' : 'Nouvelle mesure'}
            </p>
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-0.5">Mensurations</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-400 active:scale-95 transition-transform"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {/* Date */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={today}
              className="w-full h-11 px-3 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 text-sm focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
            />
          </div>

          {/* Mass section */}
          <SectionHeader icon={Scale} label="Masse" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.filter(f => f.group === 'mass').map(f => (
              <NumField key={f.key as string} field={f} value={values[f.key as string]} onChange={v => setField(f.key as string, v)} />
            ))}
          </div>

          <SectionHeader icon={Ruler} label="Tronc" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.filter(f => f.group === 'torso').map(f => (
              <NumField key={f.key as string} field={f} value={values[f.key as string]} onChange={v => setField(f.key as string, v)} />
            ))}
          </div>

          <SectionHeader icon={Ruler} label="Bras" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.filter(f => f.group === 'arms').map(f => (
              <NumField key={f.key as string} field={f} value={values[f.key as string]} onChange={v => setField(f.key as string, v)} />
            ))}
          </div>

          <SectionHeader icon={Ruler} label="Jambes" />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.filter(f => f.group === 'legs').map(f => (
              <NumField key={f.key as string} field={f} value={values[f.key as string]} onChange={v => setField(f.key as string, v)} />
            ))}
          </div>

          <div className="mb-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ressenti, conditions, etc."
              className="w-full px-3 py-2 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all resize-none"
            />
          </div>

          {onDelete && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full mt-4 h-11 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Trash2 size={14} strokeWidth={1.8} />
              Supprimer cette mesure
            </button>
          )}
          {onDelete && confirmDelete && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/8 p-3">
              <div className="flex items-center gap-2 text-[12px] text-red-300 mb-2">
                <AlertCircle size={13} strokeWidth={1.8} />
                Supprimer cette mesure ?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => { await onDelete() }}
                  className="flex-1 h-10 rounded-lg bg-red-500 text-white text-sm font-semibold active:scale-[0.97] transition-transform"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-10 rounded-lg bg-[#1C1C1C] border border-white/[0.08] text-zinc-300 text-sm font-semibold active:scale-[0.97] transition-transform"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 pt-3 border-t border-white/[0.04]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={submit}
            disabled={saving}
            className="w-full rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              height: 50,
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
              boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            {saving ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
              />
            ) : (
              <>
                <Check size={16} strokeWidth={2} />
                {initial ? 'Enregistrer' : 'Ajouter la mesure'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{ size: number; strokeWidth: number; className: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <Icon size={12} strokeWidth={1.8} className="text-[#A78BFA]" />
      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.6px]">{label}</span>
    </div>
  )
}

function NumField({ field, value, onChange }: {
  field: { key: string; label: string; unit: string }
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1 block">
        {field.label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className="w-full h-11 pl-3 pr-10 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 font-mono text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 uppercase">
          {field.unit}
        </span>
      </div>
    </div>
  )
}

// ── Main Mensurations Tab ──────────────────────────────────────────
export default function MeasurementsTab() {
  const { measurements, saveMeasurement, deleteMeasurement } = useApp()
  const [sheet, setSheet] = useState<{ open: boolean; edit: Measurement | null }>({ open: false, edit: null })

  const weightSeries = useMemo(() => {
    return [...measurements]
      .filter(m => m.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(m => ({ date: m.date, weight: m.weight as number }))
  }, [measurements])

  const latest = measurements[0]
  const previous = measurements[1]

  // Compute deltas vs previous measurement
  function delta(field: keyof Measurement) {
    if (!latest || !previous) return null
    const a = latest[field]
    const b = previous[field]
    if (typeof a !== 'number' || typeof b !== 'number') return null
    return +(a - b).toFixed(1)
  }

  if (!measurements.length) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
        >
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border"
            style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(139,92,246,0.06))', borderColor: 'rgba(139,92,246,0.2)', boxShadow: '0 0 40px -12px rgba(139,92,246,0.4)' }}>
            <Ruler size={36} className="text-[#A78BFA]" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">Aucune mesure</h3>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-[260px] mb-6">
            Note ton poids, ton % de masse grasse et tes mensurations pour suivre ta vraie progression.
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setSheet({ open: true, edit: null })}
            className="h-12 px-6 rounded-2xl text-[14px] font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
              boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Ajouter une première mesure
          </motion.button>
        </motion.div>
        <AnimatePresence>
          {sheet.open && (
            <MeasurementSheet
              initial={sheet.edit}
              onClose={() => setSheet({ open: false, edit: null })}
              onSubmit={async (p) => {
                const ok = await saveMeasurement(p, sheet.edit?.id)
                if (ok) setSheet({ open: false, edit: null })
              }}
              onDelete={sheet.edit ? async () => {
                const ok = await deleteMeasurement(sheet.edit!.id)
                if (ok) setSheet({ open: false, edit: null })
              } : undefined}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-5"
    >
      {/* Latest summary cards */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label="Poids"
            value={latest.weight != null ? `${latest.weight}kg` : '—'}
            delta={delta('weight')}
            unit="kg"
          />
          <SummaryCard
            label="% MG"
            value={latest.body_fat != null ? `${latest.body_fat}%` : '—'}
            delta={delta('body_fat')}
            unit="%"
            invertDelta
          />
        </div>
      </motion.div>

      {/* Weight chart */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          Évolution du poids
        </p>
        <div className="card-glass rounded-2xl p-4">
          <WeightChart data={weightSeries} />
        </div>
      </motion.div>

      {/* Latest body measurements */}
      {latest && FIELDS.filter(f => f.group !== 'mass').some(f => latest[f.key] != null) && (
        <motion.div variants={fadeUp}>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Mensurations · {fmtDate(latest.date)}
          </p>
          <div className="card-glass rounded-2xl p-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {FIELDS.filter(f => f.group !== 'mass' && latest[f.key] != null).map(f => {
              const d = delta(f.key)
              return (
                <div key={f.key as string} className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px]">{f.label}</div>
                    <div className="text-base font-semibold font-mono text-zinc-100 mt-0.5">
                      {latest[f.key]}<span className="text-[10px] text-zinc-500 ml-1">{f.unit}</span>
                    </div>
                  </div>
                  {d !== null && d !== 0 && (
                    <div className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${d > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {d > 0 ? <TrendingUp size={10} strokeWidth={2.4} /> : <TrendingDown size={10} strokeWidth={2.4} />}
                      {d > 0 ? '+' : ''}{d}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            Historique ({measurements.length})
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setSheet({ open: true, edit: null })}
            className="h-9 px-3 rounded-xl text-[12px] font-semibold text-white flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
              boxShadow: '0 6px 18px -6px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Nouvelle
          </motion.button>
        </div>
        <div className="card-glass rounded-2xl p-2">
          {measurements.map((m) => (
            <button
              key={m.id}
              onClick={() => setSheet({ open: true, edit: m })}
              className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors flex items-center justify-between gap-3 border-b border-white/[0.04] last:border-none"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-200">{fmtDate(m.date)}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  {m.weight != null && <span className="font-mono">{m.weight}kg</span>}
                  {m.body_fat != null && <span className="font-mono">· {m.body_fat}%MG</span>}
                  {m.chest != null && <span className="font-mono">· pec {m.chest}</span>}
                  {m.waist != null && <span className="font-mono">· taille {m.waist}</span>}
                </div>
              </div>
              <Pencil size={14} strokeWidth={1.8} className="text-zinc-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {sheet.open && (
          <MeasurementSheet
            initial={sheet.edit}
            onClose={() => setSheet({ open: false, edit: null })}
            onSubmit={async (p) => {
              const ok = await saveMeasurement(p, sheet.edit?.id)
              if (ok) setSheet({ open: false, edit: null })
            }}
            onDelete={sheet.edit ? async () => {
              const ok = await deleteMeasurement(sheet.edit!.id)
              if (ok) setSheet({ open: false, edit: null })
            } : undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SummaryCard({ label, value, delta, unit, invertDelta }: {
  label: string
  value: string
  delta: number | null
  unit: string
  invertDelta?: boolean
}) {
  // For body fat, lower is "better" (green for negative)
  const positive = delta != null && (invertDelta ? delta < 0 : delta > 0)
  const negative = delta != null && (invertDelta ? delta > 0 : delta < 0)
  const color = positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-zinc-500'

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card-glass rounded-[18px] p-4 relative overflow-hidden"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />
      <div className="text-2xl font-bold font-mono text-white tracking-tight leading-none mb-1.5">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 tracking-wide">{label}</span>
        {delta !== null && delta !== 0 && (
          <span className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${color}`}>
            {delta > 0 ? <TrendingUp size={10} strokeWidth={2.4} /> : <TrendingDown size={10} strokeWidth={2.4} />}
            {delta > 0 ? '+' : ''}{delta}{unit}
          </span>
        )}
      </div>
    </motion.div>
  )
}
