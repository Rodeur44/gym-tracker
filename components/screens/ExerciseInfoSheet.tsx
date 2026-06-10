'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { TAG_CLR, TAG_BG, TYPE_LBL } from '@/lib/constants'
import { getExerciseInfo, getMusclesForExercise } from '@/lib/exercise-info'
import { exerciseImage } from '@/lib/exercise-images'
import type { MuscleGroup } from '@/types'

const MuscleMap = dynamic(() => import('@/components/ui/MuscleMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-2xl shimmer-block" />,
})

const sheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

interface Props {
  exerciseName: string
  muscleType: MuscleGroup
  onClose: () => void
}

export default function ExerciseInfoSheet({ exerciseName, muscleType, onClose }: Props) {
  const info = getExerciseInfo(exerciseName)
  const demo = exerciseImage(exerciseName)
  const muscles = getMusclesForExercise(exerciseName, muscleType)
  const primaryMuscle = muscles[0]
  const accent = TAG_CLR[primaryMuscle]
  const bg = TAG_BG[primaryMuscle]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] flex flex-col rounded-t-[28px]"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: '0 -32px 80px -8px rgba(0,0,0,0.9)',
          maxHeight: '88vh',
        }}
        data-no-swipe
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-9 h-[3px] rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-3 flex-shrink-0">
          <div className="flex-1 min-w-0 mr-3">
            <h2 className="text-[17px] font-semibold text-white tracking-tight truncate">{exerciseName}</h2>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {muscles.map(m => (
                <span
                  key={m}
                  className="text-[10px] font-bold uppercase tracking-[1.2px] px-2 py-0.5 rounded-full border"
                  style={{ color: TAG_CLR[m], background: TAG_BG[m], borderColor: `${TAG_CLR[m]}33` }}
                >
                  {TYPE_LBL[m]}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-white/[0.05] flex items-center justify-center active:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={18} strokeWidth={1.8} className="text-zinc-400" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 px-4 flex flex-col gap-4"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
        >
          {/* Demo photo (free-exercise-db) — full-bleed thumbnail */}
          {demo && (
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ height: 240, border: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}
            >
              <Image src={demo} alt={`Démonstration : ${exerciseName}`} fill className="object-cover" sizes="480px" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
              <span className="absolute bottom-3 left-3 z-10 text-[10px] font-bold uppercase tracking-[1.4px] text-white/90">
                Démonstration
              </span>
            </div>
          )}

          {/* Muscle map */}
          <div
            className="w-full rounded-2xl flex items-center justify-center"
            style={{
              height: 240,
              background: 'radial-gradient(ellipse at center, rgba(109,40,217,0.08) 0%, rgba(0,0,0,0) 70%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <MuscleMap
              muscles={muscles}
              frontSlugs={info?.bodySlugs?.front}
              backSlugs={info?.bodySlugs?.back}
            />
          </div>

          {/* Description */}
          {info ? (
            <>
              <div
                className="rounded-2xl px-4 py-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2" style={{ color: accent }}>Comment faire</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{info.description}</p>
              </div>

              <div
                className="rounded-2xl px-4 py-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: accent }}>Conseils clés</p>
                <div className="flex flex-col gap-2.5">
                  {info.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: bg, border: `1px solid ${accent}33` }}
                      >
                        <Zap size={10} strokeWidth={2} style={{ color: accent }} />
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl px-4 py-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-sm text-zinc-500 text-center py-4">Aucune info disponible pour cet exercice.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
