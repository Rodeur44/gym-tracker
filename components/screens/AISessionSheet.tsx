'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Sparkles, ChevronRight, AlertCircle, Clock, RotateCcw } from 'lucide-react'
import type { MuscleGroup, Exercise } from '@/types'
import { TYPE_LBL, TAG_CLR, TAG_BG } from '@/lib/constants'

type Level = 'debutant' | 'intermediaire' | 'avance'
type Goal = 'force' | 'volume' | 'endurance' | 'perte_poids'
type Equipment = 'salle' | 'maison_basique' | 'maison_haltere'

interface AIProgramResult {
  title: string
  summary?: string
  exercises: { name: string; sets: number; reps: number; rest_sec: number; notes?: string }[]
}

interface Props {
  defaultType: MuscleGroup
  onClose: () => void
  onUse: (exos: Exercise[]) => void
}

const sheetVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 },
}

const LEVELS: { value: Level; label: string }[] = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
]

const GOALS: { value: Goal; label: string; sub: string }[] = [
  { value: 'force', label: 'Force', sub: 'Lourd, 4–6 reps' },
  { value: 'volume', label: 'Volume', sub: 'Hypertrophie 8–12 reps' },
  { value: 'endurance', label: 'Endurance', sub: 'Léger, 15–20 reps' },
  { value: 'perte_poids', label: 'Perte de poids', sub: 'Haute intensité' },
]

const EQUIPMENTS: { value: Equipment; label: string }[] = [
  { value: 'salle', label: 'Salle complète' },
  { value: 'maison_haltere', label: 'Maison + haltères' },
  { value: 'maison_basique', label: 'Poids du corps' },
]

const DURATIONS = [30, 45, 60, 75, 90]
const MUSCLE_TABS: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes', 'cardio']

function Chip({ active, accent, bg, onClick, children }: {
  active: boolean; accent: string; bg: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className="px-3.5 py-2 rounded-full border-[1.5px] text-[13px] font-semibold transition-all"
      style={active
        ? { borderColor: accent, background: bg, color: accent, boxShadow: `0 0 12px ${accent}44` }
        : { borderColor: 'rgba(255,255,255,0.08)', background: 'transparent', color: '#71717a' }}
    >
      {children}
    </motion.button>
  )
}

export default function AISessionSheet({ defaultType, onClose, onUse }: Props) {
  const [type, setType] = useState<MuscleGroup>(defaultType)
  const [level, setLevel] = useState<Level>('intermediaire')
  const [goal, setGoal] = useState<Goal>('volume')
  const [duration, setDuration] = useState(60)
  const [equipment, setEquipment] = useState<Equipment>('salle')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AIProgramResult | null>(null)

  const accent = TAG_CLR[type]
  const bg = TAG_BG[type]

  async function generate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, level, goal, duration, equipment, notes: notes.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur IA.'); return }
      setResult(data)
    } catch {
      setError('Impossible de contacter l\'IA. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  function handleUse() {
    if (!result) return
    const exos: Exercise[] = result.exercises.map(e => ({
      name: e.name,
      sets: Array.from({ length: e.sets }, () => ({ weight: 0, reps: e.reps })),
    }))
    onUse(exos)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-xl z-50 flex items-end justify-center"
      onClick={onClose}
      data-no-swipe
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90dvh', marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-4 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 pb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)', boxShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
              <Sparkles size={16} strokeWidth={1.8} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-white">Séance IA</h3>
              <p className="text-[11px] text-zinc-500">Gemini Flash · Gratuit</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 pb-8 flex flex-col gap-5"
          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>

          {!result ? (
            <>
              {/* Groupe */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Groupe musculaire</p>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_TABS.map(t => (
                    <Chip key={t} active={type === t} accent={TAG_CLR[t]} bg={TAG_BG[t]} onClick={() => setType(t)}>
                      {TYPE_LBL[t].split(' ')[0]}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Niveau */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Niveau</p>
                <div className="flex gap-2">
                  {LEVELS.map(l => (
                    <Chip key={l.value} active={level === l.value} accent={accent} bg={bg} onClick={() => setLevel(l.value)}>
                      {l.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Objectif */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Objectif</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <motion.button
                      key={g.value}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      onClick={() => setGoal(g.value)}
                      className="px-4 py-3 rounded-2xl border-[1.5px] text-left transition-all"
                      style={goal === g.value
                        ? { borderColor: accent, background: bg, boxShadow: `0 0 12px ${accent}33` }
                        : { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-sm font-semibold tracking-tight" style={goal === g.value ? { color: accent } : { color: '#a1a1aa' }}>{g.label}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{g.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Durée */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Durée</p>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map(d => (
                    <Chip key={d} active={duration === d} accent={accent} bg={bg} onClick={() => setDuration(d)}>
                      {d} min
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Équipement */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Matériel</p>
                <div className="flex flex-col gap-2">
                  {EQUIPMENTS.map(eq => (
                    <motion.button
                      key={eq.value}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      onClick={() => setEquipment(eq.value)}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl border-[1.5px] transition-all text-left"
                      style={equipment === eq.value
                        ? { borderColor: accent, background: bg }
                        : { borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <span className="text-sm font-medium" style={equipment === eq.value ? { color: accent } : { color: '#a1a1aa' }}>{eq.label}</span>
                      {equipment === eq.value && <ChevronRight size={14} strokeWidth={1.8} style={{ color: accent }} />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500 mb-3">Précisions (optionnel)</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Ex : pas de machine, focus ischio, blessure épaule droite…"
                  className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.1)] transition-all resize-none leading-relaxed"
                  data-no-swipe
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={generate}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)', boxShadow: '0 12px 32px -8px rgba(109,40,217,0.55)' }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={18} strokeWidth={1.8} />
                    </motion.div>
                    Génération en cours…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} strokeWidth={1.8} />
                    Générer ma séance
                  </>
                )}
              </motion.button>
            </>
          ) : (
            /* ── Result ── */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Title */}
              <div className="px-4 py-4 rounded-2xl border"
                style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.12),rgba(139,92,246,0.06))', borderColor: 'rgba(139,92,246,0.25)' }}>
                <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#A78BFA] mb-1">Séance générée</p>
                <h4 className="text-[15px] font-semibold text-white tracking-tight">{result.title}</h4>
                {result.summary && <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{result.summary}</p>}
              </div>

              {/* Exercise list */}
              <div className="flex flex-col gap-2">
                {result.exercises.map((ex, i) => (
                  <div key={i} className="px-4 py-3.5 rounded-2xl border border-white/[0.06] bg-[#1C1C1C]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-200 tracking-tight">{ex.name}</p>
                        {ex.notes && <p className="text-[11px] text-zinc-500 mt-0.5">{ex.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[12px] font-mono font-bold px-2.5 py-1 rounded-lg"
                          style={{ color: accent, background: bg }}>
                          {ex.sets}×{ex.reps}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                          <Clock size={10} strokeWidth={1.8} />
                          {ex.rest_sec}s
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => { setResult(null); setError('') }}
                  className="w-11 h-11 rounded-2xl bg-[#1C1C1C] border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                  aria-label="Régénérer"
                >
                  <RotateCcw size={16} strokeWidth={1.8} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUse}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] text-white"
                  style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)', boxShadow: '0 8px 24px -6px rgba(109,40,217,0.5)' }}
                >
                  Utiliser cette séance
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
