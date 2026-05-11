'use client'

import dynamic from 'next/dynamic'
import type { MuscleGroup } from '@/types'
import type { ExtendedBodyPart } from 'react-muscle-highlighter'

const Body = dynamic(() => import('react-muscle-highlighter'), { ssr: false })

const ACCENT = '#A78BFA'
const FILL_DEFAULT = '#16162a'
const STROKE_DEFAULT = 'rgba(255,255,255,0.07)'

// Fallback par groupe musculaire quand pas de bodySlugs spécifique
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

interface Props {
  muscles: MuscleGroup[]
  frontSlugs?: string[]
  backSlugs?: string[]
}

export default function MuscleMap({ muscles, frontSlugs: propFront, backSlugs: propBack }: Props) {
  const frontSlugs = propFront ?? [...new Set(muscles.flatMap(m => FRONT_MAP[m] ?? []))]
  const backSlugs  = propBack  ?? [...new Set(muscles.flatMap(m => BACK_MAP[m]  ?? []))]

  const showFront = frontSlugs.length > 0
  const showBack  = backSlugs.length > 0

  // SVG natif: 400px de haut × 200px de large. Container = 220px.
  // scale 0.55 → 220px × 110px par vue — ajusté si deux vues côte à côte
  const scale = (showFront && showBack) ? 0.50 : 0.55

  const bodyProps = {
    defaultFill: FILL_DEFAULT,
    defaultStroke: STROKE_DEFAULT,
    defaultStrokeWidth: 0.5,
    border: 'none' as const,
    scale,
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      {showFront && (
        <div className="flex items-center justify-center">
          <Body {...bodyProps} side="front" data={toData(frontSlugs)} />
        </div>
      )}
      {showBack && (
        <div className="flex items-center justify-center">
          <Body {...bodyProps} side="back" data={toData(backSlugs)} />
        </div>
      )}
    </div>
  )
}
