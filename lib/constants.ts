import type { MuscleGroup, GymCard } from '@/types'

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

const BASE_IMG_URL = 'https://xaysrudxlbfannwwcgmk.supabase.co/storage/v1/object/public/badges/'

export const CARDS: GymCard[] = [
  { id: 'master_squat', name: 'Maître du Squat', cond: '1RM > 1.5x Poids', rarity: 'epic', image: BASE_IMG_URL + 'master__squat.png' },
  { id: 'master_bench', name: 'Roi du Bench', cond: '1RM > 1.2x Poids', rarity: 'epic', image: BASE_IMG_URL + 'master_bench.png' },
  { id: 'master_deadlift', name: 'Titan du Deadlift', cond: '1RM > 2x Poids', rarity: 'epic', image: BASE_IMG_URL + 'master_deadlift.png' },
  { id: 'big_three', name: 'Élite des 3 Grands', cond: 'Squat+Bench+Dead', rarity: 'legendary', image: BASE_IMG_URL + 'big_three.png' },
  { id: 'volume_chest', name: 'Sculpteur Pecs', cond: 'Volume > 50T', rarity: 'rare', image: BASE_IMG_URL + 'volume_chest.png' },
  { id: 'volume_back', name: 'Guerrier du Dos', cond: '10 000 Tractions', rarity: 'rare', image: BASE_IMG_URL + 'volume_back.png' },
  { id: 'volume_legs', name: 'Légende Leg Day', cond: 'Volume > 150T', rarity: 'rare', image: BASE_IMG_URL + 'volume_legs.png' },
  { id: 'volume_arms', name: 'Annihilateur Bras', cond: 'Volume > 40T', rarity: 'rare', image: BASE_IMG_URL + 'volume_arms.png' },
  { id: 'reps_pullups', name: 'Machine Tractions', cond: '100/séance', rarity: 'rare', image: BASE_IMG_URL + 'reps_pullups.png' },
  { id: 'reps_dips', name: 'Destructeur Dips', cond: '100/séance', rarity: 'rare', image: BASE_IMG_URL + 'reps_dips.png' },
  { id: 'consist_newbie', name: 'Débutant', cond: '1ère séance', rarity: 'rare', image: BASE_IMG_URL + 'consist_newbie.png' },
  { id: 'consist_veteran', name: 'Vétéran de l\'Acier', cond: '100 séances', rarity: 'epic', image: BASE_IMG_URL + 'consist_veteran.png' },
  { id: 'consist_unstoppable', name: 'Inarrêtable', cond: 'Série > 100', rarity: 'legendary', image: BASE_IMG_URL + 'consist_unstoppable.png' },
  { id: 'goal_muscleup', name: '1er Muscle-Up', cond: '1 Répétition', rarity: 'legendary', image: BASE_IMG_URL + 'goal_muscleup.png' },
]

export const MUSCLE_ORDER: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes']
