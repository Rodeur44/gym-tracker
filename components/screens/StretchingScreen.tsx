'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, ChevronRight, Trophy } from 'lucide-react'
import type { MuscleGroup } from '@/types'
import { TAG_CLR, TAG_BG, TYPE_LBL } from '@/lib/constants'

interface Stretch {
  name: string
  duration: number
  tip: string
}

const STRETCHES: Record<MuscleGroup, Stretch[]> = {
  pec: [
    { name: 'Étirement pectoraux aux portes', duration: 30, tip: 'Avant-bras à 90°, avance doucement le buste' },
    { name: 'Croix au sol', duration: 30, tip: 'Allonge-toi, bras en croix, rotation lente du tronc' },
    { name: 'Étirement épaule croisée', duration: 25, tip: 'Tire le bras vers toi, maintiens sans forcer' },
    { name: 'Ouverture poitrine (mains derrière)', duration: 30, tip: 'Mains croisées dans le dos, ouvre la poitrine' },
  ],
  dos: [
    { name: 'Enfant (yoga)', duration: 40, tip: 'Bras tendus devant, front au sol, respire profondément' },
    { name: 'Chat-Vache', duration: 30, tip: '4 pattes, alterne dos rond et creux, 5 répétitions' },
    { name: 'Étirement lat debout', duration: 25, tip: 'Bras levé, penche-toi latéralement, tire le lat' },
    { name: 'Rotation colonne assis', duration: 20, tip: 'Assis, tourne lentement le buste gauche puis droite' },
  ],
  bras: [
    { name: 'Étirement biceps au mur', duration: 25, tip: 'Main au mur doigts vers le bas, tourne doucement' },
    { name: 'Étirement triceps', duration: 25, tip: 'Bras plié derrière la tête, pousse le coude avec l\'autre main' },
    { name: 'Rotation des poignets', duration: 20, tip: '10 rotations lentes dans chaque sens' },
    { name: 'Étirement avant-bras', duration: 25, tip: 'Bras tendu, replie les doigts vers toi, tire doucement' },
  ],
  jambes: [
    { name: 'Fente basse (hip flexor)', duration: 35, tip: 'Genou au sol, avance les hanches, dos droit' },
    { name: 'Étirement ischio (toucher pieds)', duration: 30, tip: 'Jambes tendues, descends lentement sans arrondir le dos' },
    { name: 'Pigeon au sol', duration: 40, tip: 'Jambe avant pliée à 90°, jambe arrière tendue, respire' },
    { name: 'Quadriceps debout', duration: 25, tip: 'Appuie-toi si besoin, tire le pied vers la fesse' },
    { name: 'Mollets au mur', duration: 25, tip: 'Pied à plat, talon au sol, pousse le mur' },
  ],
  cardio: [
    { name: 'Fente basse (hip flexor)', duration: 35, tip: 'Genou au sol, avance les hanches, dos droit' },
    { name: 'Mollets au mur', duration: 30, tip: 'Pied à plat, talon au sol, pousse le mur' },
    { name: 'Rotation des hanches', duration: 25, tip: 'Debout, mains sur les hanches, cercles lents' },
    { name: 'Étirement dos en croix', duration: 30, tip: 'Allonge-toi, bras en croix, rotation lente du tronc' },
  ],
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
}

interface Props {
  muscleGroup: MuscleGroup
  onClose: () => void
}

export default function StretchingScreen({ muscleGroup, onClose }: Props) {
  const stretches = STRETCHES[muscleGroup]
  const [index, setIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(stretches[0].duration)
  const [done, setDone] = useState(false)

  const current = stretches[index]
  const accent = TAG_CLR[muscleGroup]
  const bg = TAG_BG[muscleGroup]
  const progress = 1 - timeLeft / current.duration
  const circumference = 2 * Math.PI * 52

  const next = useCallback(() => {
    if (index < stretches.length - 1) {
      setIndex(i => i + 1)
      setTimeLeft(stretches[index + 1].duration)
    } else {
      setDone(true)
    }
  }, [index, stretches])

  useEffect(() => {
    if (done) return
    setTimeLeft(current.duration)
  }, [index, current.duration, done])

  useEffect(() => {
    if (done) return
    if (timeLeft <= 0) { next(); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, done, next])

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#0A0A0A', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      data-no-swipe
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
        style={{ paddingTop: 'max(20px, env(safe-area-inset-top, 20px))' }}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-zinc-500">Récupération active</p>
          <h2 className="text-xl font-semibold tracking-tight text-white mt-0.5">
            {TYPE_LBL[muscleGroup].split(' ')[0]}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Passer les étirements"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C1C] border border-white/[0.06] text-zinc-500 text-[12px] font-semibold hover:text-zinc-300 transition-colors"
        >
          Passer <X size={13} strokeWidth={1.8} />
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 px-5 mb-6 flex-shrink-0">
        {stretches.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              flex: i === index ? 2 : 1,
              background: i < index ? accent : i === index ? accent : 'rgba(255,255,255,0.1)',
              opacity: i > index ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              {/* Timer ring */}
              <div className="relative w-32 h-32 mb-8">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={accent}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${accent}88)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-white leading-none">{timeLeft}</span>
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wide mt-1">sec</span>
                </div>
              </div>

              {/* Stretch name */}
              <h3 className="text-[22px] font-semibold tracking-tight text-white text-center mb-3 leading-tight">
                {current.name}
              </h3>

              {/* Tip */}
              <p className="text-sm text-zinc-500 text-center leading-relaxed max-w-[280px] mb-10">
                {current.tip}
              </p>

              {/* Counter */}
              <p className="text-[12px] text-zinc-600 mb-6">
                {index + 1} / {stretches.length}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div
                className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6"
                style={{ background: `linear-gradient(135deg,${accent}22,${accent}10)`, border: `1px solid ${accent}44`, boxShadow: `0 0 40px -12px ${accent}88` }}
              >
                <Trophy size={40} strokeWidth={1.5} style={{ color: accent }} />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-white mb-3">Séance terminée !</h3>
              <p className="text-sm text-zinc-500 text-center leading-relaxed max-w-[240px]">
                Étirements complétés. Ton corps te remerciera demain.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="px-5 pb-8 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={done ? onClose : next}
          className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)`, boxShadow: '0 12px 32px -8px rgba(109,40,217,0.55)' }}
        >
          {done ? 'Fermer' : (
            <>
              Étirement suivant <ChevronRight size={18} strokeWidth={2} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
