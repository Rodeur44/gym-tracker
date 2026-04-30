export type MuscleGroup = 'pec' | 'dos' | 'bras' | 'jambes' | 'cardio'

export interface ExoSet {
  weight: number
  reps: number
}

export interface Exercise {
  name: string
  sets: ExoSet[]
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

export interface GymCard {
  id: string
  name: string
  cond: string
  rarity: 'rare' | 'epic' | 'legendary'
  image: string
}
