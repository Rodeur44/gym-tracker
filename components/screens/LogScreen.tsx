'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronRight, AlertCircle, Camera, Copy, CopyPlus, LayoutGrid, Check, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { TYPE_LBL, TAG_CLR, TAG_BG, EXO_BY_TYPE, WORKOUT_TEMPLATES } from '@/lib/constants'
import type { WorkoutTemplate } from '@/lib/constants'
import type { MuscleGroup, Exercise } from '@/types'
import AISessionSheet from '@/components/screens/AISessionSheet'

const MUSCLE_TABS: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes', 'cardio']

// ── Exercise Picker Modal ─────────────────────────────────────────
function ExoPicker({ type, onPick, onClose, getBest, allPrev }: {
  type: MuscleGroup
  onPick: (name: string) => void
  onClose: () => void
  getBest: (name: string) => number
  allPrev: string[]
}) {
  const [q, setQ] = useState('')
  const clr = TAG_CLR[type]

  const recent = allPrev.slice(0, 6)
  const pool = EXO_BY_TYPE[type]
  const suggested = pool.filter(n => !allPrev.includes(n))
  const displayed = suggested.length ? suggested : pool

  const filtered = q
    ? [...new Set([...allPrev, ...Object.values(EXO_BY_TYPE).flat()])].filter(n => n.toLowerCase().includes(q.toLowerCase())).slice(0, 12)
    : null

  function ExoRow({ name }: { name: string }) {
    const pr = getBest(name)
    return (
      <motion.div
        whileTap={{ scale: 0.98, opacity: 0.6 }}
        onClick={() => onPick(name)}
        className="flex items-center gap-3 px-2 py-3.5 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all group border-b border-white/[0.04] last:border-none"
      >
        <div className="w-[3px] h-7 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:h-8 transition-all" style={{ background: clr }} />
        <span className="flex-1 text-sm text-zinc-200 tracking-tight">{name}</span>
        {pr > 0 && (
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg border flex-shrink-0"
            style={{ color: clr, background: TAG_BG[type], borderColor: `${clr}33` }}>
            {pr} kg
          </span>
        )}
        <ChevronRight size={14} className="text-zinc-600 flex-shrink-0" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />
        <div className="px-4 mb-3 flex-shrink-0">
          <input
            autoFocus
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher un exercice…"
            className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] outline-none transition-all"
          />
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-10">
          {filtered ? (
            <>
              {filtered.map(n => <ExoRow key={n} name={n} />)}
              {!filtered.some(n => n.toLowerCase() === q.toLowerCase()) && (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPick(q)}
                  className="flex items-center gap-3 px-2 py-3.5 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-[3px] h-7 rounded-full flex-shrink-0 opacity-40" style={{ background: clr }} />
                  <span className="text-sm text-zinc-500">+ Ajouter &ldquo;<strong className="text-zinc-200">{q}</strong>&rdquo;</span>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* Accès rapide */}
              <div className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3 pt-1">Accès rapide</div>
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => onPick('Machine')}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer card-glass border border-white/[0.06] min-h-[56px] group"
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: TAG_BG[type], border: `1px solid ${clr}33` }}
                >
                  <Camera size={20} strokeWidth={1.8} style={{ color: clr }} />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-[15px] font-semibold tracking-tight text-white">Machine sans nom</span>
                  <span className="text-[11px] text-zinc-500">Renomme l&apos;exercice après</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} className="text-zinc-600 flex-shrink-0 group-hover:text-zinc-400 transition-colors" />
              </motion.div>

              {/* Récents */}
              {recent.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[1.2px] mb-2 mt-4">Récents</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recent.map(n => (
                      <motion.button key={n} whileTap={{ scale: 0.94 }} onClick={() => onPick(n)}
                        className="px-3.5 py-2 rounded-full border text-xs font-medium transition-all hover:border-white/10"
                        style={{ background: TAG_BG[type], color: clr, borderColor: `${clr}33` }}>
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {/* Suggérés */}
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[1.2px] mb-1 mt-2">
                Suggérés — {TYPE_LBL[type]}
              </div>
              {displayed.map(n => <ExoRow key={n} name={n} />)}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Weight slider (isolated touch — never bubbles to swipe handler) ─
function WeightSlider({ value, onChange, trackStyle }: {
  value: number
  onChange: (v: number) => void
  trackStyle: React.CSSProperties
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = (e: TouchEvent) => e.stopPropagation()
    el.addEventListener('touchstart', stop, { passive: true })
    el.addEventListener('touchmove', stop, { passive: true })
    el.addEventListener('touchend', stop, { passive: true })
    return () => {
      el.removeEventListener('touchstart', stop)
      el.removeEventListener('touchmove', stop)
      el.removeEventListener('touchend', stop)
    }
  }, [])

  return (
    <input
      ref={ref}
      type="range" min={0} max={250} step={2.5}
      value={value}
      onChange={e => onChange(+e.target.value)}
      className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
      style={{ ...trackStyle, touchAction: 'pan-x' }}
    />
  )
}

// ── Set Row ───────────────────────────────────────────────────────
function SetRow({ set, idx, accent, onWeightChange, onRepsChange, onDelete }: {
  set: { weight: number; reps: number }
  idx: number
  accent: string
  onWeightChange: (v: number) => void
  onRepsChange: (delta: number) => void
  onDelete: () => void
}) {
  const { startRest } = useApp()
  const pct = (set.weight / 250 * 100).toFixed(1)
  const trackStyle = { background: `linear-gradient(to right,${accent} ${pct}%,#1C1C1C ${pct}%)` }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="py-3.5 border-b border-white/[0.04] last:border-none last:pb-0"
    >
      <div className="flex items-center gap-2.5 mb-3">
        {/* Badge numéro */}
        <div className="w-[26px] h-[26px] rounded-[8px] bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-[11px] font-bold text-zinc-500 font-mono flex-shrink-0">
          {idx + 1}
        </div>
        {/* Poids */}
        <div className="flex items-baseline gap-1 min-w-[72px]">
          <span className="text-[22px] font-bold font-mono text-white leading-none tracking-tight">
            {set.weight > 0 ? set.weight : '—'}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
            {set.weight > 0 ? 'KG' : 'CORPS'}
          </span>
        </div>
        <span className="text-xs text-zinc-600 font-mono flex-shrink-0">×</span>
        {/* Reps stepper */}
        <div className="flex items-center bg-[#1C1C1C] border border-white/[0.06] rounded-xl overflow-hidden flex-1 hover:border-white/10 transition-all">
          <button onClick={() => onRepsChange(-1)} className="w-10 h-11 flex items-center justify-center text-xl font-light text-white hover:bg-[rgba(139,92,246,0.08)] active:bg-[rgba(139,92,246,0.18)] active:scale-90 transition-all">−</button>
          <div className="flex-1 flex flex-col items-center justify-center min-h-11">
            <span className="text-sm font-bold font-mono text-white">{set.reps}</span>
            <span className="text-[9px] text-zinc-600 uppercase tracking-wide">REPS</span>
          </div>
          <button onClick={() => onRepsChange(1)} className="w-10 h-11 flex items-center justify-center text-xl font-light text-white hover:bg-[rgba(139,92,246,0.08)] active:bg-[rgba(139,92,246,0.18)] active:scale-90 transition-all">+</button>
        </div>
        {/* Done & rest */}
        <button
          onClick={() => startRest()}
          aria-label="Marquer fait et démarrer le repos"
          className="w-[30px] h-[30px] rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 flex-shrink-0 hover:text-[#A78BFA] hover:border-[#A78BFA]/40 active:bg-[#7C3AED] active:text-white active:scale-90 transition-all duration-200"
        >
          <Check size={14} strokeWidth={2.2} />
        </button>
        {/* Delete */}
        <button onClick={onDelete} aria-label="Supprimer la série"
          className="w-[30px] h-[30px] rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 flex-shrink-0 hover:text-red-400 hover:border-red-400/30 active:bg-red-500 active:text-white active:rotate-90 transition-all duration-200">
          <X size={14} />
        </button>
      </div>
      {/* Weight slider */}
      <div className="pl-9 pr-1" data-no-swipe>
        <WeightSlider value={set.weight} onChange={onWeightChange} trackStyle={trackStyle} />
      </div>
    </motion.div>
  )
}

// ── Exo Card ──────────────────────────────────────────────────────
function ExoCard({ exo, idx, accent, getBest, onChange, onDelete, onDuplicate }: {
  exo: Exercise
  idx: number
  accent: string
  getBest: (n: string) => number
  onChange: (updated: Exercise) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const pr = getBest(exo.name)
  const maxW = Math.max(0, ...exo.sets.map(s => s.weight || 0))
  const isRecord = pr > 0 && maxW > pr
  const [renaming, setRenaming] = useState(false)
  const [nameVal, setNameVal] = useState(exo.name)

  function updateSet(si: number, field: 'weight' | 'reps', val: number) {
    const sets = exo.sets.map((s, i) => i === si ? { ...s, [field]: Math.max(field === 'reps' ? 1 : 0, val) } : s)
    onChange({ ...exo, sets })
  }

  function addSet() {
    const last = exo.sets[exo.sets.length - 1] || { weight: 0, reps: 10 }
    onChange({ ...exo, sets: [...exo.sets, { ...last }] })
  }

  function removeSet(si: number) {
    const sets = exo.sets.filter((_, i) => i !== si)
    if (!sets.length) { onDelete(); return }
    onChange({ ...exo, sets })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="rounded-[22px] overflow-hidden border"
      style={{
        background: 'linear-gradient(180deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.015) 100%)',
        borderLeft: `3px solid ${accent}`,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 flex items-start justify-between gap-3 border-b border-white/[0.06]">
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={() => { onChange({ ...exo, name: nameVal.trim() || exo.name }); setRenaming(false) }}
              onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="bg-transparent border-b border-[#A78BFA] text-[15px] font-semibold text-white w-full outline-none pb-0.5 font-sans tracking-tight"
            />
          ) : (
            <button onClick={() => setRenaming(true)} className="text-[15px] font-semibold text-white tracking-tight text-left w-full active:opacity-50 transition-opacity">
              {exo.name}
            </button>
          )}
          <div className="mt-1">
            {isRecord ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                🏆 NOUVEAU RECORD
              </span>
            ) : pr > 0 ? (
              <span className="text-[11px] text-zinc-600">Record · <span className="text-zinc-300 font-semibold font-mono">{pr} kg</span></span>
            ) : (
              <span className="text-[10px] text-zinc-700">Touche le nom pour renommer</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            onClick={onDuplicate}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label="Dupliquer l'exercice en bas de liste"
            className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-[#A78BFA] hover:border-[#A78BFA]/30 transition-all duration-200"
          >
            <CopyPlus size={14} strokeWidth={1.8} />
          </motion.button>
          <button onClick={onDelete} aria-label="Supprimer l'exercice"
            className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 flex-shrink-0 hover:text-red-400 hover:border-red-400/30 active:rotate-90 active:bg-red-500 active:text-white transition-all duration-200">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Sets */}
      <div className="px-4">
        <AnimatePresence>
          {exo.sets.map((set, si) => (
            <SetRow
              key={si}
              set={set}
              idx={si}
              accent={accent}
              onWeightChange={v => updateSet(si, 'weight', v)}
              onRepsChange={delta => updateSet(si, 'reps', (set.reps || 1) + delta)}
              onDelete={() => removeSet(si)}
            />
          ))}
        </AnimatePresence>
        <div className="flex gap-2 mt-3 mb-4">
          {exo.sets.length > 0 && (
            <motion.button
              onClick={addSet}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-xs font-semibold text-[#A78BFA] flex items-center justify-center gap-2 bg-[rgba(139,92,246,0.06)] hover:bg-[rgba(139,92,246,0.1)] active:bg-[rgba(139,92,246,0.14)] transition-colors"
            >
              <Copy size={13} strokeWidth={1.8} />
              Dupliquer ·{' '}
              {exo.sets[exo.sets.length - 1].weight > 0
                ? `${exo.sets[exo.sets.length - 1].weight}kg`
                : 'corps'}{' '}
              × {exo.sets[exo.sets.length - 1].reps}
            </motion.button>
          )}
          <motion.button
            onClick={() => onChange({ ...exo, sets: [...exo.sets, { weight: 0, reps: 10 }] })}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`py-3 rounded-xl border-dashed border-[1.5px] border-white/10 text-xs font-semibold text-zinc-600 flex items-center justify-center gap-1.5 hover:border-white/20 hover:text-zinc-400 transition-all ${exo.sets.length > 0 ? 'px-3' : 'flex-1'}`}
            aria-label="Nouvelle série vierge"
          >
            <Plus size={13} strokeWidth={1.8} />
            {exo.sets.length === 0 ? 'Ajouter une série' : ''}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Template Sheet ────────────────────────────────────────────────
function TemplateSheet({ onClose, onPick, getBest }: {
  onClose: () => void
  onPick: (t: WorkoutTemplate) => void
  getBest: (name: string) => number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl flex flex-col"
        style={{ maxHeight: 'calc(85vh - 80px)', marginBottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />
        <div className="px-5 pb-3 flex-shrink-0">
          <h3 className="text-base font-semibold text-white">Programmes</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Sélectionne un programme pour pré-remplir ta séance</p>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-8 flex flex-col gap-3">
          {WORKOUT_TEMPLATES.map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => onPick(t)}
              className="w-full text-left bg-[#1C1C1C] border border-white/[0.06] rounded-2xl p-4 hover:border-[rgba(139,92,246,0.3)] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-200">{t.name}</span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ color: TAG_CLR[t.type], background: TAG_BG[t.type], borderColor: `${TAG_CLR[t.type]}33` }}>
                  {TYPE_LBL[t.type].split(' ')[0]}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {t.exos.slice(0, 3).map(e => {
                  const best = getBest(e.name)
                  return (
                    <div key={e.name} className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 truncate">{e.name}</span>
                      <span className="text-[11px] font-mono text-zinc-600 ml-2 flex-shrink-0">
                        {e.sets}×{e.reps}{best > 0 ? ` · ${best}kg` : ''}
                      </span>
                    </div>
                  )
                })}
                {t.exos.length > 3 && (
                  <span className="text-[11px] text-zinc-600 mt-0.5">+{t.exos.length - 3} exercices…</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Log Screen ────────────────────────────────────────────────────
export default function LogScreen() {
  const { currentExos, setCurrentExos, logType, setLogType, editMode, editSessionId, cancelEdit, saveSession, getBest, sessions, isPro, openPro } = useApp()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!isPro) setAiOpen(false) }, [isPro])

  const allPrev = [...new Set(sessions.flatMap(s => (s.exos || []).map(e => e.name)))]
  const accent = TAG_CLR[logType]

  const updateExo = useCallback((idx: number, updated: Exercise) => {
    setCurrentExos(currentExos.map((e, i) => i === idx ? updated : e))
  }, [currentExos, setCurrentExos])

  const removeExo = useCallback((idx: number) => {
    setCurrentExos(currentExos.filter((_, i) => i !== idx))
  }, [currentExos, setCurrentExos])

  const duplicateExo = useCallback((idx: number) => {
    const copy = { ...currentExos[idx], sets: currentExos[idx].sets.map(s => ({ ...s })) }
    setCurrentExos([...currentExos, copy])
  }, [currentExos, setCurrentExos])

  function loadTemplate(t: WorkoutTemplate) {
    setLogType(t.type)
    setCurrentExos(t.exos.map(e => ({
      name: e.name,
      sets: Array.from({ length: e.sets }, () => ({ weight: getBest(e.name), reps: e.reps })),
    })))
    setTemplatesOpen(false)
  }

  function pickExo(name: string) {
    const pr = getBest(name)
    setCurrentExos([...currentExos, { name, sets: [{ weight: pr, reps: 10 }] }])
    setPickerOpen(false)
  }

  async function handleSave() {
    if (!currentExos.length) { setError('Ajoute au moins un exercice !'); return }
    setError('')
    const ok = await saveSession({ date, type: logType, notes, exos: currentExos })
    if (ok) {
      setCurrentExos([]); setNotes(''); setDate(new Date().toISOString().slice(0, 10))
    } else {
      setError('Erreur lors de la sauvegarde.')
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pt-5 pb-28 flex flex-col gap-4">
        {/* Edit banner */}
        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl border"
              style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)', boxShadow: '0 0 24px -8px rgba(139,92,246,0.35)' }}
            >
              <div>
                <div className="text-[12px] font-bold text-[#A78BFA] tracking-wide">MODE MODIFICATION</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">Séance du {date}</div>
              </div>
              <button onClick={cancelEdit} className="bg-[#1C1C1C] border border-white/[0.06] rounded-xl px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all">
                Annuler
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title row */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold tracking-tight">Séance</h2>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-[#1C1C1C] border border-white/[0.06] rounded-xl px-3 py-1.5 text-[13px] font-mono text-zinc-300 outline-none focus:border-[#A78BFA] transition-all"
          />
        </div>

        {/* Type pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MUSCLE_TABS.map(t => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.94 }}
              onClick={() => setLogType(t)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full border-[1.5px] text-[13px] font-semibold transition-all ${logType === t ? 'shadow-lg' : 'border-white/[0.06] bg-[#1C1C1C] text-zinc-500'}`}
              style={logType === t ? { borderColor: accent, background: TAG_BG[t], color: accent, boxShadow: `0 0 16px ${accent}55` } : {}}
            >
              {TYPE_LBL[t].split(' ')[0]}
            </motion.button>
          ))}
        </div>

        {/* Template + IA triggers */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setTemplatesOpen(true)}
            className="flex items-center gap-2 text-[12px] font-semibold text-zinc-500 px-3 py-2 rounded-xl border border-white/[0.06] bg-[#1C1C1C] hover:text-[#A78BFA] hover:border-[rgba(139,92,246,0.3)] transition-all"
          >
            <LayoutGrid size={14} strokeWidth={1.8} />
            Programme
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => isPro ? setAiOpen(true) : openPro()}
            className="flex items-center gap-2 text-[12px] font-semibold px-3 py-2 rounded-xl border transition-all"
            style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.25)', color: '#A78BFA' }}
          >
            <Sparkles size={14} strokeWidth={1.8} />
            IA{!isPro && ' ✦'}
          </motion.button>
        </div>

        {/* Exercise cards */}
        <AnimatePresence mode="popLayout">
          {currentExos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 px-6 rounded-2xl border-[1.5px] border-dashed border-white/10 text-zinc-600 text-sm leading-relaxed"
            >
              Appuie sur <strong className="text-zinc-400">+ Ajouter un exercice</strong><br />pour démarrer ta séance
            </motion.div>
          ) : (
            currentExos.map((exo, i) => (
              <ExoCard
                key={`${exo.name}-${i}`}
                exo={exo}
                idx={i}
                accent={accent}
                getBest={getBest}
                onChange={updated => updateExo(i, updated)}
                onDelete={() => removeExo(i)}
                onDuplicate={() => duplicateExo(i)}
              />
            ))
          )}
        </AnimatePresence>

        {/* Add exercise button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setPickerOpen(true)}
          className="w-full py-5 rounded-[18px] border-[1.5px] border-dashed border-white/10 text-zinc-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-[#A78BFA] hover:text-[#A78BFA] hover:bg-[rgba(139,92,246,0.04)] transition-all"
        >
          <Plus size={14} /> Ajouter un exercice
        </motion.button>

        {/* Notes */}
        <details className="bg-[#1C1C1C] border border-white/[0.06] rounded-2xl overflow-hidden group">
          <summary className="flex items-center justify-between px-4 py-3.5 text-sm font-medium text-zinc-500 cursor-pointer list-none hover:text-zinc-300 transition-colors">
            <span>Notes optionnelles</span>
            <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-4 pb-4">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Ressenti, douleurs, objectifs…"
              className="w-full bg-transparent text-sm text-zinc-300 placeholder:text-zinc-700 outline-none resize-none leading-relaxed mt-2 border-t border-white/[0.04] pt-3"
            />
          </div>
        </details>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)', boxShadow: '0 12px 32px -8px rgba(109,40,217,0.6)' }}
        >
          {editMode ? 'Mettre à jour la séance' : 'Enregistrer la séance'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {pickerOpen && (
          <ExoPicker
            type={logType}
            onPick={pickExo}
            onClose={() => setPickerOpen(false)}
            getBest={getBest}
            allPrev={allPrev}
          />
        )}
        {templatesOpen && (
          <TemplateSheet
            onClose={() => setTemplatesOpen(false)}
            onPick={loadTemplate}
            getBest={getBest}
          />
        )}
        {aiOpen && (
          <AISessionSheet
            defaultType={logType}
            onClose={() => setAiOpen(false)}
            onUse={exos => { setCurrentExos(exos); setAiOpen(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
