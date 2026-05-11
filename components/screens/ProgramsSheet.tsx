'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, ChevronDown, Lock, Play, Coffee, Dumbbell } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PROGRAMS, dayToExercises } from '@/lib/programs'
import { TAG_CLR, TAG_BG, TYPE_LBL } from '@/lib/constants'
import type { MuscleGroup, Session } from '@/types'

const sheetVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: '60%', opacity: 0 },
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
    if (program.pro && !isPro) { openPro(); return }

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
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-end"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-h-[92vh] flex flex-col rounded-t-[28px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #0F0F0F 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderBottom: 'none',
          boxShadow: '0 -24px 80px -12px rgba(0,0,0,0.8)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Programmes</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Structures tes séances sur la durée</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"
          >
            <X size={16} strokeWidth={1.8} className="text-zinc-400" />
          </button>
        </div>

        {/* Program list */}
        <div className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-3">
          {PROGRAMS.map(program => {
            const locked = program.pro && !isPro
            const expanded = expandedId === program.id

            return (
              <div
                key={program.id}
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: expanded ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
                  background: expanded ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.025)',
                }}
              >
                {/* Program header */}
                <button
                  onClick={() => setExpandedId(expanded ? '' : program.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-white tracking-tight">{program.name}</span>
                      {locked && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[1.2px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
                          <Lock size={8} strokeWidth={2} />Pro
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 font-mono">{program.tag}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[11px] text-zinc-500">{program.level}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} strokeWidth={1.8} className="text-zinc-500 flex-shrink-0 ml-3" />
                  </motion.div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Description */}
                      <div className="px-4 pb-3">
                        <p className="text-[12px] text-zinc-500 leading-relaxed">{program.description}</p>
                      </div>

                      {/* Days */}
                      <div className="px-4 pb-4 flex flex-col gap-2">
                        {program.days.map((day, i) => {
                          const isRest = !day.type
                          const accent = day.type ? TAG_CLR[day.type as MuscleGroup] : '#52525b'
                          const bg = day.type ? TAG_BG[day.type as MuscleGroup] : 'rgba(82,82,91,0.08)'

                          return (
                            <div
                              key={i}
                              className="rounded-xl p-3 border"
                              style={{
                                borderColor: isRest ? 'rgba(255,255,255,0.04)' : `${accent}22`,
                                background: isRest ? 'transparent' : bg,
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: isRest ? 'rgba(255,255,255,0.04)' : `${accent}18` }}
                                  >
                                    {isRest
                                      ? <Coffee size={12} strokeWidth={1.8} className="text-zinc-600" />
                                      : <Dumbbell size={12} strokeWidth={1.8} style={{ color: accent }} />
                                    }
                                  </div>
                                  <span className={`text-[13px] font-medium truncate ${isRest ? 'text-zinc-600' : 'text-zinc-200'}`}>
                                    {day.label}
                                  </span>
                                </div>

                                {!isRest && (
                                  <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    onClick={() => startDay(program.id, i)}
                                    aria-label={`Démarrer ${day.label}`}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-lg text-[11px] font-semibold"
                                    style={locked
                                      ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: '#FBBF24' }
                                      : { background: `${accent}18`, border: `1px solid ${accent}30`, color: accent }
                                    }
                                  >
                                    {locked
                                      ? <><Lock size={11} strokeWidth={2} />Pro</>
                                      : <><Play size={11} strokeWidth={2} />Démarrer</>
                                    }
                                  </motion.button>
                                )}
                              </div>

                              {/* Exercises preview */}
                              {!isRest && day.exos.length > 0 && (
                                <div className="mt-2.5 flex flex-col gap-1">
                                  {day.exos.slice(0, 4).map((exo, j) => (
                                    <div key={j} className="flex items-center justify-between">
                                      <span className="text-[11px] text-zinc-500 truncate mr-2">{exo.name}</span>
                                      <span className="text-[11px] font-mono text-zinc-600 flex-shrink-0">
                                        {exo.sets}×{exo.reps}
                                      </span>
                                    </div>
                                  ))}
                                  {day.exos.length > 4 && (
                                    <span className="text-[11px] text-zinc-600 mt-0.5">+{day.exos.length - 4} exercices</span>
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

          {/* Bottom safe area */}
          <div className="h-6" />
        </div>
      </motion.div>
    </motion.div>
  )
}
