export type MuscleGroup = 'pec' | 'dos' | 'bras' | 'jambes' | 'cardio'

export interface ExoSet {
  weight: number
  reps: number
}

export interface Exercise {
  name: string
  sets: ExoSet[]
  // Groupe musculaire propre à l'exercice (séances multi-groupes).
  // Optionnel : les anciennes séances retombent sur Session.type.
  type?: MuscleGroup
  // Ressenti global de l'exercice (toutes séries confondues).
  note?: string
}

export interface Session {
  id: string
  user_id: string
  date: string
  type: MuscleGroup
  notes: string
  exos: Exercise[]
  created_at?: string
}

export interface UserCard {
  card_id: string
  user_id: string
}

export type Rarity = 'rare' | 'epic' | 'legendary'

// A collectible card. The visual is built in-app (frame + Lucide icon window),
// no external images. `metric` reads derived stats so the unlock check and the
// progress bar share a single source of truth.
export interface GymCard {
  id: string
  name: string
  cond: string
  rarity: Rarity
  icon: import('lucide-react').LucideIcon
  // Optional illustration shown in the card window (Midjourney art, etc.).
  // When absent, the Lucide `icon` is used as a clean fallback.
  art?: string
  // Progress: card is unlocked once metric(stats) >= target.
  metric: (stats: import('@/lib/cards').CardStats) => number
  target: number
  unit: 'séances' | 'reps' | 'kg' | 'T' | 'j' | 'count'
}

export interface Measurement {
  id: string
  user_id: string
  date: string
  weight: number | null
  body_fat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  arm_left: number | null
  arm_right: number | null
  thigh_left: number | null
  thigh_right: number | null
  notes: string | null
  created_at?: string
}

export type MeasurementInput = Omit<Measurement, 'id' | 'user_id' | 'created_at'>
