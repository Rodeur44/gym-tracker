// Données de démonstration partagées par les trois directions de redesign.
// Statiques et réalistes : elles imitent un utilisateur actif depuis 3 mois.

export interface MockSet {
  weight: number
  reps: number
  done: boolean
}

export interface MockExo {
  name: string
  group: 'pec' | 'dos' | 'bras' | 'jambes' | 'cardio'
  last: string // dernière perf affichable
  target: string // cible suggérée
  sets: MockSet[]
  pr?: boolean
}

export const NEXT_TYPE = 'Dos'
export const NEXT_TIP = 'Dernière : 8 juil. — vise 92,5 kg au rowing barre'

export const STATS = {
  sessions: 47,
  streak: 3,
  cards: 12,
  weekVolume: '12 430 kg',
  level: 12,
  xp: 68, // % vers le niveau suivant
}

// L, M, M, J, V, S, D — semaine en cours
export const WEEK: { label: string; done: boolean; today?: boolean }[] = [
  { label: 'L', done: true },
  { label: 'M', done: false },
  { label: 'M', done: true },
  { label: 'J', done: true },
  { label: 'V', done: false, today: true },
  { label: 'S', done: false },
  { label: 'D', done: false },
]

export const LAST_SESSION = {
  type: 'Pec',
  date: '10 juil.',
  duration: '52 min',
  volume: '4 820 kg',
  exos: [
    { name: 'Développé couché', best: '80 kg', sets: '4×8' },
    { name: 'Développé incliné', best: '57,5 kg', sets: '3×10' },
    { name: 'Écarté câble', best: '22,5 kg', sets: '3×12' },
    { name: 'Dips', best: '+10 kg', sets: '3×10' },
  ],
}

// Séance « Dos » en cours dans les maquettes Séance
export const SESSION_EXOS: MockExo[] = [
  {
    name: 'Tractions',
    group: 'dos',
    last: '+5 kg × 8',
    target: '+7,5 kg × 8',
    sets: [
      { weight: 7.5, reps: 8, done: true },
      { weight: 7.5, reps: 8, done: true },
      { weight: 7.5, reps: 6, done: false },
    ],
  },
  {
    name: 'Rowing barre',
    group: 'dos',
    last: '90 kg × 8',
    target: '92,5 kg × 8',
    pr: true,
    sets: [
      { weight: 92.5, reps: 8, done: true },
      { weight: 92.5, reps: 8, done: false },
      { weight: 92.5, reps: 8, done: false },
    ],
  },
  {
    name: 'Tirage vertical',
    group: 'dos',
    last: '65 kg × 10',
    target: '67,5 kg × 10',
    sets: [
      { weight: 67.5, reps: 10, done: false },
      { weight: 67.5, reps: 10, done: false },
      { weight: 67.5, reps: 10, done: false },
    ],
  },
]

export const LIVE = {
  elapsed: '34:12',
  volume: '2 140 kg',
  setsDone: 3,
  setsTotal: 9,
  rest: '01:24',
}
