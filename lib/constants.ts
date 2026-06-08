import type { MuscleGroup } from '@/types'

export const TYPE_LBL: Record<MuscleGroup, string> = {
  pec: 'Pec / Poitrine',
  dos: 'Dos',
  bras: 'Bras / Épaules',
  jambes: 'Jambes',
  cardio: 'Cardio',
}

export const TAG_CLR: Record<MuscleGroup, string> = {
  pec: '#A78BFA',
  dos: '#818CF8',
  bras: '#FB923C',
  jambes: '#F87171',
  cardio: '#34D399',
}

export const TAG_BG: Record<MuscleGroup, string> = {
  pec: 'rgba(167,139,250,0.12)',
  dos: 'rgba(129,140,248,0.10)',
  bras: 'rgba(251,146,60,0.10)',
  jambes: 'rgba(248,113,113,0.10)',
  cardio: 'rgba(52,211,153,0.10)',
}

export const EXO_BY_TYPE: Record<MuscleGroup, string[]> = {
  pec: ['Développé couché', 'Développé incliné', 'Développé décliné', 'Écarté haltères', 'Écarté câble', 'Pec deck', 'Dips', 'Push-up', 'Développé haltères couché'],
  dos: ['Tractions', 'Tirage vertical', 'Rowing barre', 'Rowing haltère', 'Deadlift', 'Soulevé de terre', 'Tirage câble bas', 'Pull-over', 'Shrug', 'Face pull'],
  bras: ['Curl haltères', 'Curl barre', 'Curl marteau', 'Triceps corde', 'Triceps barre', 'Skullcrusher', 'Overhead press', 'Développé militaire', 'Élévation latérale', 'Élévation frontale'],
  jambes: ['Squat', 'Leg press', 'Fentes', 'Romanian deadlift', 'Leg curl', 'Leg extension', 'Mollets debout', 'Mollets assis', 'Hip thrust', 'Bulgarian split squat'],
  cardio: ['Course à pied', 'Vélo', 'Rameur', 'Corde à sauter', 'Elliptique', 'HIIT', 'Natation', 'Boxe', 'Ski erg'],
}

// The collectible-card catalog lives in `lib/cards.ts` (catalog + unlock logic + progress).

export const MUSCLE_ORDER: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes']

export type WorkoutTemplate = {
  id: string
  name: string
  type: MuscleGroup
  exos: { name: string; sets: number; reps: number }[]
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'ppl_push',
    name: 'Push (PPL)',
    type: 'pec',
    exos: [
      { name: 'Développé couché', sets: 4, reps: 8 },
      { name: 'Développé incliné', sets: 3, reps: 10 },
      { name: 'Écarté câble', sets: 3, reps: 12 },
      { name: 'Overhead press', sets: 3, reps: 8 },
      { name: 'Dips', sets: 3, reps: 10 },
    ],
  },
  {
    id: 'ppl_pull',
    name: 'Pull (PPL)',
    type: 'dos',
    exos: [
      { name: 'Tractions', sets: 4, reps: 8 },
      { name: 'Rowing barre', sets: 3, reps: 8 },
      { name: 'Tirage vertical', sets: 3, reps: 10 },
      { name: 'Rowing haltère', sets: 3, reps: 10 },
      { name: 'Face pull', sets: 3, reps: 15 },
    ],
  },
  {
    id: 'ppl_legs',
    name: 'Legs (PPL)',
    type: 'jambes',
    exos: [
      { name: 'Squat', sets: 4, reps: 5 },
      { name: 'Leg press', sets: 3, reps: 10 },
      { name: 'Romanian deadlift', sets: 3, reps: 8 },
      { name: 'Leg curl', sets: 3, reps: 12 },
      { name: 'Mollets debout', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body',
    type: 'pec',
    exos: [
      { name: 'Développé couché', sets: 3, reps: 8 },
      { name: 'Tractions', sets: 3, reps: 8 },
      { name: 'Overhead press', sets: 3, reps: 8 },
      { name: 'Rowing barre', sets: 3, reps: 10 },
      { name: 'Curl haltères', sets: 3, reps: 10 },
    ],
  },
  {
    id: 'lower',
    name: 'Lower Body',
    type: 'jambes',
    exos: [
      { name: 'Squat', sets: 4, reps: 5 },
      { name: 'Romanian deadlift', sets: 3, reps: 8 },
      { name: 'Leg press', sets: 3, reps: 10 },
      { name: 'Hip thrust', sets: 3, reps: 10 },
      { name: 'Mollets debout', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    type: 'pec',
    exos: [
      { name: 'Squat', sets: 3, reps: 5 },
      { name: 'Développé couché', sets: 3, reps: 8 },
      { name: 'Tractions', sets: 3, reps: 6 },
      { name: 'Deadlift', sets: 3, reps: 5 },
      { name: 'Overhead press', sets: 3, reps: 8 },
    ],
  },
  {
    id: 'bras',
    name: 'Bras & Épaules',
    type: 'bras',
    exos: [
      { name: 'Curl haltères', sets: 4, reps: 10 },
      { name: 'Triceps corde', sets: 4, reps: 12 },
      { name: 'Overhead press', sets: 3, reps: 8 },
      { name: 'Élévation latérale', sets: 3, reps: 15 },
      { name: 'Curl marteau', sets: 3, reps: 10 },
    ],
  },
]
