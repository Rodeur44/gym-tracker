import type { MuscleGroup, Exercise } from '@/types'

export interface ProgramExo {
  name: string
  sets: number
  reps: string
  rest: number
  notes?: string
}

export interface ProgramDay {
  label: string
  type: MuscleGroup | null
  exos: ProgramExo[]
}

export interface Program {
  id: string
  name: string
  tag: string
  level: string
  description: string
  pro: boolean
  days: ProgramDay[]
}

export function dayToExercises(day: ProgramDay): Exercise[] {
  if (!day.type || day.exos.length === 0) return []
  return day.exos.map(e => ({
    name: e.name,
    sets: Array.from({ length: e.sets }, () => ({
      weight: 0,
      reps: parseInt(e.reps) || 8,
    })),
  }))
}

export const PROGRAMS: Program[] = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    tag: '3–6j / semaine',
    level: 'Intermédiaire',
    description: 'Cycle en 3 séances (Push, Pull, Legs) répété 1 à 2 fois par semaine. Idéal pour maximiser la fréquence par groupe musculaire.',
    pro: false,
    days: [
      {
        label: 'Push — Pectoraux & Épaules',
        type: 'pec',
        exos: [
          { name: 'Développé couché', sets: 4, reps: '6', rest: 180, notes: 'Composé principal — lourds' },
          { name: 'Développé incliné', sets: 3, reps: '10', rest: 120, notes: 'Focalise la contraction haute' },
          { name: 'Overhead press', sets: 3, reps: '8', rest: 120 },
          { name: 'Dips', sets: 3, reps: '12', rest: 90, notes: 'Corps incliné vers l\'avant' },
          { name: 'Élévation latérale', sets: 4, reps: '15', rest: 60, notes: 'Léger, contrôle total' },
        ],
      },
      {
        label: 'Pull — Dos & Biceps',
        type: 'dos',
        exos: [
          { name: 'Tractions', sets: 4, reps: '6', rest: 180, notes: 'Prise pronation, full ROM' },
          { name: 'Rowing barre', sets: 3, reps: '8', rest: 120, notes: 'Coudes serrés, squeeze dos' },
          { name: 'Tirage vertical', sets: 3, reps: '10', rest: 90 },
          { name: 'Face pull', sets: 3, reps: '15', rest: 60, notes: 'Coudes hauts, rotation externe' },
          { name: 'Curl haltères', sets: 3, reps: '12', rest: 60 },
        ],
      },
      {
        label: 'Legs — Jambes complètes',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 4, reps: '5', rest: 240, notes: 'Profondeur max, dos droit' },
          { name: 'Romanian deadlift', sets: 3, reps: '8', rest: 120, notes: 'Étire les ischio à fond' },
          { name: 'Leg press', sets: 3, reps: '12', rest: 90 },
          { name: 'Leg curl', sets: 3, reps: '12', rest: 60 },
          { name: 'Mollets debout', sets: 4, reps: '15', rest: 60, notes: 'Pause en bas, full stretch' },
        ],
      },
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower',
    tag: '4j / semaine',
    level: 'Débutant → Intermédiaire',
    description: 'Alterne haut et bas du corps 2 fois par semaine. Parfait pour débuter avec une fréquence élevée par groupe.',
    pro: true,
    days: [
      {
        label: 'Upper A — Force',
        type: 'pec',
        exos: [
          { name: 'Développé couché', sets: 4, reps: '5', rest: 180 },
          { name: 'Tractions', sets: 4, reps: '5', rest: 180 },
          { name: 'Overhead press', sets: 3, reps: '8', rest: 120 },
          { name: 'Rowing haltère', sets: 3, reps: '8', rest: 90 },
          { name: 'Curl barre', sets: 2, reps: '10', rest: 60 },
          { name: 'Triceps corde', sets: 2, reps: '10', rest: 60 },
        ],
      },
      {
        label: 'Lower A — Force',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 4, reps: '5', rest: 240, notes: 'Lourd, pause 1s en bas' },
          { name: 'Romanian deadlift', sets: 3, reps: '8', rest: 120 },
          { name: 'Leg press', sets: 3, reps: '10', rest: 90 },
          { name: 'Leg curl', sets: 3, reps: '10', rest: 60 },
          { name: 'Mollets debout', sets: 4, reps: '12', rest: 60 },
        ],
      },
      {
        label: 'Upper B — Volume',
        type: 'pec',
        exos: [
          { name: 'Développé incliné', sets: 4, reps: '10', rest: 120 },
          { name: 'Tirage vertical', sets: 4, reps: '10', rest: 120 },
          { name: 'Écarté haltères', sets: 3, reps: '12', rest: 90 },
          { name: 'Face pull', sets: 3, reps: '15', rest: 60 },
          { name: 'Curl marteau', sets: 3, reps: '12', rest: 60 },
          { name: 'Skullcrusher', sets: 3, reps: '12', rest: 60 },
        ],
      },
      {
        label: 'Lower B — Volume',
        type: 'jambes',
        exos: [
          { name: 'Soulevé de terre', sets: 3, reps: '5', rest: 240, notes: 'Technique parfaite avant tout' },
          { name: 'Bulgarian split squat', sets: 3, reps: '10', rest: 90, notes: 'Par jambe' },
          { name: 'Leg extension', sets: 3, reps: '15', rest: 60 },
          { name: 'Hip thrust', sets: 3, reps: '12', rest: 90 },
          { name: 'Mollets assis', sets: 4, reps: '15', rest: 60 },
        ],
      },
    ],
  },
  {
    id: '531',
    name: '5/3/1 Wendle',
    tag: '4j / semaine',
    level: 'Intermédiaire → Avancé',
    description: 'Programme de force de Jim Wendler. 4 leviers principaux cyclés sur 4 semaines (5, 3, 1, deload). Progression garantie sur le long terme.',
    pro: true,
    days: [
      {
        label: 'Lundi — Squat',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 3, reps: '5/3/1', rest: 240, notes: 'Semaine 1: 5×65/75/85% | S2: 3×70/80/90% | S3: 5/3/1×75/85/95%' },
          { name: 'Squat', sets: 5, reps: '10', rest: 120, notes: 'Assistance — 50-60% du max' },
          { name: 'Romanian deadlift', sets: 5, reps: '10', rest: 90 },
          { name: 'Leg curl', sets: 5, reps: '10', rest: 60 },
        ],
      },
      {
        label: 'Mardi — Développé couché',
        type: 'pec',
        exos: [
          { name: 'Développé couché', sets: 3, reps: '5/3/1', rest: 240, notes: 'Semaine 1: 5×65/75/85% | S2: 3×70/80/90% | S3: 5/3/1×75/85/95%' },
          { name: 'Développé couché', sets: 5, reps: '10', rest: 120, notes: 'Assistance — 50-60% du max' },
          { name: 'Tirage vertical', sets: 5, reps: '10', rest: 90 },
          { name: 'Curl haltères', sets: 5, reps: '10', rest: 60 },
          { name: 'Dips', sets: 5, reps: '10', rest: 60 },
        ],
      },
      {
        label: 'Jeudi — Soulevé de terre',
        type: 'dos',
        exos: [
          { name: 'Soulevé de terre', sets: 3, reps: '5/3/1', rest: 300, notes: 'Semaine 1: 5×65/75/85% | S2: 3×70/80/90% | S3: 5/3/1×75/85/95%' },
          { name: 'Soulevé de terre', sets: 5, reps: '10', rest: 150, notes: 'Assistance — 50-60% du max' },
          { name: 'Rowing barre', sets: 5, reps: '10', rest: 90 },
          { name: 'Tractions', sets: 5, reps: '10', rest: 90 },
        ],
      },
      {
        label: 'Vendredi — Overhead press',
        type: 'bras',
        exos: [
          { name: 'Overhead press', sets: 3, reps: '5/3/1', rest: 240, notes: 'Semaine 1: 5×65/75/85% | S2: 3×70/80/90% | S3: 5/3/1×75/85/95%' },
          { name: 'Overhead press', sets: 5, reps: '10', rest: 120, notes: 'Assistance — 50-60% du max' },
          { name: 'Développé couché', sets: 5, reps: '10', rest: 90 },
          { name: 'Triceps corde', sets: 5, reps: '15', rest: 60 },
          { name: 'Curl marteau', sets: 5, reps: '10', rest: 60 },
        ],
      },
    ],
  },
  {
    id: 'phat',
    name: 'PHAT',
    tag: '5j / semaine',
    level: 'Avancé',
    description: 'Power Hypertrophy Adaptive Training (Layne Norton). 2 jours de force + 3 jours d\'hypertrophie. Maximise force et volume simultanément.',
    pro: true,
    days: [
      {
        label: 'J1 — Upper Power',
        type: 'pec',
        exos: [
          { name: 'Rowing barre', sets: 3, reps: '3-5', rest: 240, notes: 'Explosif à la montée' },
          { name: 'Tractions', sets: 2, reps: '3-5', rest: 180 },
          { name: 'Développé couché', sets: 3, reps: '3-5', rest: 240 },
          { name: 'Développé incliné', sets: 2, reps: '3-5', rest: 180 },
          { name: 'Overhead press', sets: 3, reps: '3-5', rest: 180 },
          { name: 'Curl barre', sets: 3, reps: '3-5', rest: 120 },
          { name: 'Skullcrusher', sets: 3, reps: '3-5', rest: 120 },
        ],
      },
      {
        label: 'J2 — Lower Power',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 3, reps: '3-5', rest: 300, notes: 'Max effort, descente contrôlée' },
          { name: 'Leg press', sets: 2, reps: '3-5', rest: 180 },
          { name: 'Leg curl', sets: 2, reps: '3-5', rest: 180 },
          { name: 'Soulevé de terre', sets: 3, reps: '3-5', rest: 300 },
          { name: 'Mollets debout', sets: 3, reps: '6-10', rest: 90 },
        ],
      },
      {
        label: 'J3 — Repos',
        type: null,
        exos: [],
      },
      {
        label: 'J4 — Dos & Épaules',
        type: 'dos',
        exos: [
          { name: 'Tirage vertical', sets: 3, reps: '8-12', rest: 120 },
          { name: 'Rowing câble', sets: 3, reps: '8-12', rest: 90 },
          { name: 'Rowing haltère', sets: 2, reps: '12-15', rest: 90 },
          { name: 'Face pull', sets: 4, reps: '12-15', rest: 60, notes: 'Coudes hauts' },
          { name: 'Élévation latérale', sets: 4, reps: '12-15', rest: 60 },
          { name: 'Shrug', sets: 4, reps: '12-15', rest: 60 },
        ],
      },
      {
        label: 'J5 — Lower Hypertrophie',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 6, reps: '10-15', rest: 120, notes: '70% du max, focus contraction' },
          { name: 'Romanian deadlift', sets: 3, reps: '10-15', rest: 90 },
          { name: 'Leg press', sets: 4, reps: '10-15', rest: 90 },
          { name: 'Leg curl', sets: 4, reps: '10-15', rest: 60 },
          { name: 'Leg extension', sets: 4, reps: '10-15', rest: 60 },
          { name: 'Mollets assis', sets: 4, reps: '10-15', rest: 60 },
        ],
      },
      {
        label: 'J6 — Pectoraux & Bras',
        type: 'pec',
        exos: [
          { name: 'Développé couché', sets: 4, reps: '10-15', rest: 120, notes: '75% du max, full ROM' },
          { name: 'Développé incliné', sets: 4, reps: '10-15', rest: 90 },
          { name: 'Écarté câble', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Curl haltères', sets: 4, reps: '10-15', rest: 60 },
          { name: 'Curl marteau', sets: 4, reps: '10-15', rest: 60 },
          { name: 'Triceps corde', sets: 4, reps: '10-15', rest: 60 },
          { name: 'Skullcrusher', sets: 4, reps: '10-15', rest: 60 },
        ],
      },
      {
        label: 'J7 — Repos',
        type: null,
        exos: [],
      },
    ],
  },
  {
    id: 'gvt',
    name: 'GVT — German Volume',
    tag: '3j / semaine',
    level: 'Intermédiaire → Avancé',
    description: '10 séries × 10 reps sur les exercices principaux. Méthode d\'hypertrophie extrême développée par Charles Poliquin. Prévoir 60% de ton max.',
    pro: true,
    days: [
      {
        label: 'Jour A — Pectoraux / Dos',
        type: 'pec',
        exos: [
          { name: 'Développé couché', sets: 10, reps: '10', rest: 90, notes: '60% du max — 90s de repos' },
          { name: 'Tractions', sets: 10, reps: '10', rest: 90, notes: '60% du max — bande si nécessaire' },
          { name: 'Écarté haltères', sets: 3, reps: '12', rest: 60, notes: 'Isolation légère' },
          { name: 'Face pull', sets: 3, reps: '15', rest: 60 },
        ],
      },
      {
        label: 'Jour B — Jambes',
        type: 'jambes',
        exos: [
          { name: 'Squat', sets: 10, reps: '10', rest: 90, notes: '60% du max — tempo 4010' },
          { name: 'Romanian deadlift', sets: 10, reps: '10', rest: 90 },
          { name: 'Leg curl', sets: 3, reps: '12', rest: 60 },
          { name: 'Mollets debout', sets: 3, reps: '15', rest: 45, notes: 'Pause 2s en bas' },
        ],
      },
      {
        label: 'Jour C — Épaules / Bras',
        type: 'bras',
        exos: [
          { name: 'Overhead press', sets: 10, reps: '10', rest: 90, notes: '60% du max — contrôlé' },
          { name: 'Curl barre', sets: 10, reps: '10', rest: 90 },
          { name: 'Dips', sets: 3, reps: '15', rest: 60, notes: 'Lest si trop facile' },
          { name: 'Élévation latérale', sets: 3, reps: '15', rest: 45 },
        ],
      },
    ],
  },
]
