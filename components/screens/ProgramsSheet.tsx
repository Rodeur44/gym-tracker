'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, ChevronDown, Lock, Play, Coffee } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PROGRAMS, dayToExercises } from '@/lib/programs'
import { TAG_CLR, TYPE_LBL } from '@/lib/constants'
import type { MuscleGroup, Session } from '@/types'

const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

interface Props {
  onClose: () => void
}

export default function ProgramsSheet({ onClose }: Props) {
  const { isPro, openPro, repeatSession } = useApp()
  const [expandedId, setExpandedId] = useState<string>(PROGRAMS[0].id)

  function startDay(programId: string, dayIdx: number) {
    const program = PROGRAMS.find(p => p.id === programId)
    if (!program) return
    const day = program.days[dayIdx]
    if (!day.type) return

    if (program.pro && !isPro) {
      onClose()
      setTimeout(() => openPro(), 200)
      return
    }

    const exos = dayToExercises(day)
    const fake: Session = {
      id: 'prog',
      user_id: '',
      created_at: '',
      date: new Date().toISOString().slice(0, 10),
      type: day.type,
      notes: '',
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
          maxHeight: '90vh',
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
            <h2 className="text-[17px] font-semibold text-white tracking-tight">Programmes</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Structure tes séances sur la durée</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center active:bg-white/10 transition-colors"
          >
            <X size={18} strokeWidth={1.8} className="text-zinc-400" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-3" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
          {PROGRAMS.map(program => {
            const locked = program.pro && !isPro
            const expanded = expandedId === program.id

            return (
              <div
                key={program.id}
                className="rounded-2xl"
                style={{
                  border: expanded
                    ? '1px solid rgba(139,92,246,0.25)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background: expanded
                    ? 'rgba(139,92,246,0.05)'
                    : 'rgba(255,255,255,0.03)',
                }}
              >
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedId(expanded ? '' : program.id)}
                  className="w-full flex items-center gap-3 px-4 text-left"
                  style={{ minHeight: 64 }}
                >
                  <div className="flex-1 min-w-0 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-white tracking-tight leading-tight">{program.name}</span>
                      {locked && (
                        <span
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[1.2px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}
                        >
                          <Lock size={8} strokeWidth={2.5} />Pro
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-zinc-500 font-mono">
                      {program.tag} · {program.level}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={18} strokeWidth={1.8} className="text-zinc-500" />
                  </motion.div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* Description */}
                      <div className="px-4 pb-4 border-t border-white/[0.05]">
                        <p className="text-sm text-zinc-400 leading-relaxed pt-3">{program.description}</p>
                      </div>

                      {/* Days */}
                      <div className="px-4 pb-4 flex flex-col gap-2">
                        {program.days.map((day, i) => {
                          const isRest = !day.type
                          const accent = day.type ? TAG_CLR[day.type as MuscleGroup] : '#52525b'

                          if (isRest) {
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-3 px-3 rounded-xl"
                                style={{ minHeight: 44, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                              >
                                <Coffee size={14} strokeWidth={1.8} className="text-zinc-600 flex-shrink-0" />
                                <span className="text-sm text-zinc-600">{day.label}</span>
                              </div>
                            )
                          }

                          return (
                            <div
                              key={i}
                              className="rounded-xl overflow-hidden"
                              style={{ border: `1px solid ${accent}20`, background: `${accent}08` }}
                            >
                              {/* Day header row */}
                              <div className="flex items-center justify-between px-3 gap-2" style={{ minHeight: 52 }}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: accent, boxShadow: `0 0 6px ${accent}88` }}
                                  />
                                  <span className="text-sm font-medium text-zinc-200 truncate">{day.label}</span>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.94 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                  onClick={() => startDay(program.id, i)}
                                  aria-label={`Démarrer ${day.label}`}
                                  className="flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-[12px] font-semibold"
                                  style={{
                                    minHeight: 36,
                                    minWidth: 44,
                                    ...(locked
                                      ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }
                                      : { background: `${accent}18`, border: `1px solid ${accent}35`, color: accent }),
                                  }}
                                >
                                  {locked
                                    ? <><Lock size={11} strokeWidth={2} />Pro</>
                                    : <><Play size={11} strokeWidth={2} />Démarrer</>
                                  }
                                </motion.button>
                              </div>

                              {/* Exercises */}
                              {day.exos.length > 0 && (
                                <div className="mx-3 mb-3 rounded-lg overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                  {day.exos.slice(0, 5).map((exo, j) => (
                                    <div
                                      key={j}
                                      className="flex items-center justify-between px-3 py-2"
                                      style={{ borderTop: j > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                                    >
                                      <span className="text-sm text-zinc-400 truncate mr-3">{exo.name}</span>
                                      <span className="text-[12px] font-mono text-zinc-500 flex-shrink-0">
                                        {exo.sets}×{exo.reps}
                                      </span>
                                    </div>
                                  ))}
                                  {day.exos.length > 5 && (
                                    <div className="px-3 py-2 border-t border-white/[0.04]">
                                      <span className="text-[12px] text-zinc-600">+{day.exos.length - 5} exercices</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
