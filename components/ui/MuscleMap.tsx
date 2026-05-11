'use client'

import dynamic from 'next/dynamic'
import type { MuscleGroup } from '@/types'
import type { ExtendedBodyPart } from 'react-muscle-highlighter'

const Body = dynamic(() => import('react-muscle-highlighter'), { ssr: false })

const ACCENT = '#A78BFA'
const FILL_DEFAULT = '#16162a'
const STROKE_DEFAULT = 'rgba(255,255,255,0.07)'

const FRONT_MAP: Record<MuscleGroup, string[]> = {
  pec:    ['chest', 'deltoids'],
  bras:   ['biceps', 'triceps', 'forearm', 'deltoids'],
  jambes: ['quadriceps', 'adductors', 'calves'],
  cardio: ['chest', 'abs', 'obliques', 'quadriceps', 'calves', 'biceps', 'deltoids'],
  dos:    [],
}

const BACK_MAP: Record<MuscleGroup, string[]> = {
  dos:    ['upper-back', 'lower-back', 'trapezius', 'deltoids'],
  jambes: ['hamstring', 'gluteal', 'calves'],
  cardio: ['upper-back', 'lower-back', 'hamstring', 'gluteal', 'triceps'],
  pec:    [],
  bras:   [],
}

function toData(slugs: string[]): ExtendedBodyPart[] {
  return slugs.map(slug => ({ slug: slug as ExtendedBodyPart['slug'], styles: { fill: ACCENT } }))
}

const BODY_PROPS = {
  defaultFill: FILL_DEFAULT,
  defaultStroke: STROKE_DEFAULT,
  defaultStrokeWidth: 0.5,
  border: 'none' as const,
  scale: 1,
}

export default function MuscleMap({ muscles }: { muscles: MuscleGroup[] }) {
  const frontSlugs = [...new Set(muscles.flatMap(m => FRONT_MAP[m] ?? []))]
  const backSlugs  = [...new Set(muscles.flatMap(m => BACK_MAP[m]  ?? []))]

  const showFront = frontSlugs.length > 0
  const showBack  = backSlugs.length > 0

  return (
    <div className="flex items-center justify-center w-full h-full gap-2">
      {showFront && (
        <div className="flex-1 flex items-center justify-center h-full">
          <Body {...BODY_PROPS} side="front" data={toData(frontSlugs)} />
        </div>
      )}
      {showBack && (
        <div className="flex-1 flex items-center justify-center h-full">
          <Body {...BODY_PROPS} side="back" data={toData(backSlugs)} />
        </div>
      )}
    </div>
  )
}
