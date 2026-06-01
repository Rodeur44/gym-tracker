'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Send, Loader2, Zap, ChevronDown } from 'lucide-react'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { useApp } from '@/context/AppContext'
import { TAG_CLR, TAG_BG, TYPE_LBL } from '@/lib/constants'
import type { MuscleGroup, Session, Exercise } from '@/types'
import { sessionSchema } from '@/lib/ai-schemas'

const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

interface Props {
  onClose: () => void
}

export default function AICoachSheet({ onClose }: Props) {
  const { sessions, repeatSession } = useApp()
  const [prompt, setPrompt] = useState('')
  const [notes, setNotes] = useState('')
  const [includePastNotes, setIncludePastNotes] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { object: result, submit, isLoading } = useObject({
    api: '/api/ai/session',
    schema: sessionSchema,
    onError: () => setError('Impossible de générer la séance. Réessaie.'),
  })

  function generate() {
    if (!prompt.trim() || isLoading) return
    setError(null)
    submit({ prompt, notes, includePastNotes, sessions })
  }

  function startSession() {
    const type = (result?.type ?? 'pec') as MuscleGroup
    const exos: Exercise[] = (result?.exos ?? [])
      .filter((e): e is NonNullable<typeof e> => !!e && !!e.name)
      .map(e => ({
        name: e.name!,
        sets: (e.sets ?? [])
          .filter((s): s is NonNullable<typeof s> => !!s)
          .map(s => ({ weight: s.weight ?? 0, reps: s.reps ?? 10 })),
      }))
      .filter(e => e.sets.length > 0)
    if (!exos.length) return
    const fake: Session = {
      id: 'ai-gen',
      user_id: '',
      created_at: '',
      date: new Date().toISOString().slice(0, 10),
      type,
      notes: notes.trim() || '',
      exos,
    }
    repeatSession(fake)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex flex-col rounded-t-[28px]"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: '0 -32px 80px -8px rgba(0,0,0,0.9)',
          maxHeight: '92vh',
        }}
        data-no-swipe
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-4 flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[17px] font-semibold text-white tracking-tight">Coach IA</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Décris ta séance en langage naturel</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center active:bg-white/10 transition-colors"
          >
            <X size={18} strokeWidth={1.8} className="text-zinc-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>

          {/* Main prompt */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.5px]">Ta séance</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ex: poids du corps, moitié de séance, un peu de dos et pec"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                autoFocus
                className="flex-1 h-11 px-4 rounded-xl text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.045)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e4e4e7',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={generate}
                disabled={!prompt.trim() || isLoading}
                aria-label="Générer la séance"
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)' }}
              >
                {isLoading
                  ? <Loader2 size={16} strokeWidth={1.8} className="text-white animate-spin" />
                  : <Send size={16} strokeWidth={1.8} className="text-white" />
                }
              </motion.button>
            </div>
          </div>

          {/* Notes optionnelles */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
          >
            <button
              onClick={() => setNotesOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 text-left"
              style={{ minHeight: 48 }}
            >
              <span className="text-sm text-zinc-400">Notes optionnelles</span>
              <motion.div
                animate={{ rotate: notesOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChevronDown size={16} strokeWidth={1.8} className="text-zinc-600" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="px-4 pb-4 border-t border-white/[0.05]">
                    <textarea
                      placeholder="ex: j'ai mal au bas du dos, évite les charges lourdes. Je veux bosser les biceps en priorité."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full mt-3 px-3 py-3 rounded-xl text-sm outline-none resize-none"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#e4e4e7',
                      }}
                    />
                    <p className="text-[11px] text-zinc-600 mt-2">Ces notes sont prioritaires sur tout le reste.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle notes passées */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-200">Notes des séances précédentes</p>
              <p className="text-[12px] text-zinc-500 mt-0.5">L'IA lit tes ressentis passés pour s'adapter</p>
            </div>
            <button
              onClick={() => setIncludePastNotes(v => !v)}
              aria-label="Activer ou désactiver les notes passées"
              className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3"
              style={{ background: includePastNotes ? '#7C3AED' : 'rgba(255,255,255,0.12)' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                style={{ transform: includePastNotes ? 'translateX(21px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 px-1">{error}</p>
          )}

          {/* Loading skeleton — uniquement avant l'arrivée du premier exercice */}
          {isLoading && !result?.exos?.length && (
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          )}

          {/* Result — les exercices apparaissent au fil du streaming */}
          {!!result?.exos?.length && (() => {
            const rtype = (result.type ?? 'pec') as MuscleGroup
            return (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                    style={{ color: TAG_CLR[rtype], background: TAG_BG[rtype], borderColor: `${TAG_CLR[rtype]}33` }}
                  >
                    {TYPE_LBL[rtype]}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                    {isLoading && <Loader2 size={11} strokeWidth={1.8} className="animate-spin" />}
                    {result.exos.length} exercice{result.exos.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 mb-4">
                  {result.exos.map((e, i) => {
                    const sets = e?.sets ?? []
                    const w = Math.max(0, ...sets.map(s => s?.weight || 0))
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-none"
                      >
                        <span className="text-sm text-zinc-200 truncate mr-3">{e?.name ?? '…'}</span>
                        {sets.length > 0 && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {w > 0 && (
                              <span className="text-[11px] font-mono font-semibold" style={{ color: TAG_CLR[rtype] }}>{w}kg</span>
                            )}
                            <span className="text-[11px] text-zinc-500 font-mono bg-[#1C1C1C] border border-white/[0.06] px-2 py-0.5 rounded-lg">
                              {sets.length}×{sets[0]?.reps ?? '?'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {!isLoading && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={startSession}
                    className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.45)' }}
                  >
                    <Zap size={16} strokeWidth={1.8} />
                    Commencer cette séance
                  </motion.button>
                )}
              </div>
            )
          })()}
        </div>
      </motion.div>
    </motion.div>
  )
}
