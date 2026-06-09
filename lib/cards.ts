import {
  Footprints, CalendarCheck, Medal, Trophy, Flame, Dumbbell, Mountain,
  Swords, Crown, Activity, Gem, Zap, Target, TrendingUp, Repeat,
  Heart, Bike, PersonStanding, Sparkles, Shield, Rocket,
} from 'lucide-react'
import type { Session, MuscleGroup, GymCard, Rarity } from '@/types'
import { computeStreak, exosVolume } from '@/lib/stats'

// ── Rarity styling — single source of truth for both the grid and the reveal ──
export const RARITY_STYLE: Record<Rarity, {
  lbl: string; clr: string; glow: string; grad: string; intensity: number
}> = {
  rare:      { lbl: 'Rare',       clr: '#60A5FA', glow: 'rgba(96,165,250,0.45)',  grad: 'linear-gradient(150deg,#1e293b,#1e3a5f)',  intensity: 0.35 },
  epic:      { lbl: 'Épique',     clr: '#C084FC', glow: 'rgba(192,132,252,0.45)', grad: 'linear-gradient(150deg,#2a1840,#3b1f5e)',  intensity: 0.6  },
  legendary: { lbl: 'Légendaire', clr: '#FBBF24', glow: 'rgba(251,191,36,0.5)',   grad: 'linear-gradient(150deg,#3a2c0a,#5c4410)',  intensity: 0.95 },
}

// ── Derived stats — computed once, shared by every card's metric ──────────────
export interface CardStats {
  total: number
  streak: number
  totalVolume: number
  totalReps: number
  distinctExercises: number
  mainMuscleGroups: number
  bigThreeCount: number
  eliteTotal: number
  volumeByType: (t: MuscleGroup) => number
  maxWeight: (keywords: string[]) => number
  repsForKeyword: (keyword: string) => number
  maxRepsInSession: (keyword: string) => number
  sessionsOfType: (t: MuscleGroup) => number
}

const lc = (s: string) => s.toLowerCase()

export function deriveStats(sessions: Session[]): CardStats {
  // Flatten exercises once, resolving each exo's effective muscle group.
  const exos = sessions.flatMap(s => s.exos.map(e => ({ ...e, _type: e.type ?? s.type })))

  const volumeByType = (t: MuscleGroup) => exosVolume(exos.filter(e => e._type === t))

  const maxWeight = (keywords: string[]) =>
    Math.max(0, ...exos
      .filter(e => keywords.some(k => lc(e.name).includes(k)))
      .flatMap(e => e.sets.map(st => st.weight || 0)))

  const repsForKeyword = (keyword: string) =>
    exos.filter(e => lc(e.name).includes(keyword))
      .flatMap(e => e.sets)
      .reduce((a, st) => a + (st.reps || 0), 0)

  const maxRepsInSession = (keyword: string) =>
    Math.max(0, ...sessions.map(s =>
      s.exos.filter(e => lc(e.name).includes(keyword))
        .flatMap(e => e.sets)
        .reduce((a, st) => a + (st.reps || 0), 0)))

  const sessionsOfType = (t: MuscleGroup) => sessions.filter(s => s.type === t).length

  const hasEx = (keyword: string) => exos.some(e => lc(e.name).includes(keyword))
  const lifts: string[][] = [['squat'], ['bench', 'développé couché'], ['deadlift', 'soulevé de terre']]
  const bigThreeCount = lifts.filter(kws => kws.some(hasEx)).length
  const eliteTotal =
    maxWeight(['squat']) + maxWeight(['bench', 'développé couché']) + maxWeight(['deadlift', 'soulevé de terre'])

  const mainGroups: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes']

  return {
    total: sessions.length,
    streak: computeStreak(sessions.map(s => s.date)),
    totalVolume: exosVolume(exos),
    totalReps: exos.flatMap(e => e.sets).reduce((a, st) => a + (st.reps || 0), 0),
    distinctExercises: new Set(exos.map(e => lc(e.name.trim())).filter(Boolean)).size,
    mainMuscleGroups: mainGroups.filter(t => sessionsOfType(t) > 0).length,
    bigThreeCount,
    eliteTotal,
    volumeByType,
    maxWeight,
    repsForKeyword,
    maxRepsInSession,
    sessionsOfType,
  }
}

// ── The catalog ───────────────────────────────────────────────────────────────
// Difficulty curve: rare = reachable in weeks, epic = months of consistency,
// legendary = long-term / elite. IDs are stable (persisted in user_cards).
const BENCH = ['bench', 'développé couché']
const DEAD = ['deadlift', 'soulevé de terre']
const OHP = ['overhead', 'militaire', 'développé militaire']

export const CARDS: GymCard[] = [
  // — Régularité —
  { id: 'first_session', name: 'Premier Pas', cond: 'Ta toute première séance', rarity: 'rare', icon: Footprints, art: '/cards/first_session.png', metric: s => s.total, target: 1, unit: 'séances' },
  { id: 'sessions_10', name: 'Habitué', cond: '10 séances enregistrées', rarity: 'rare', icon: CalendarCheck, art: '/cards/sessions_10.png', metric: s => s.total, target: 10, unit: 'séances' },
  { id: 'sessions_50', name: 'Pilier de la Salle', cond: '50 séances enregistrées', rarity: 'epic', icon: CalendarCheck, art: '/cards/sessions_50.png', metric: s => s.total, target: 50, unit: 'séances' },
  { id: 'sessions_100', name: 'Centurion', cond: '100 séances enregistrées', rarity: 'epic', icon: Medal, art: '/cards/sessions_100.png', metric: s => s.total, target: 100, unit: 'séances' },
  { id: 'sessions_250', name: 'Légende Vivante', cond: '250 séances enregistrées', rarity: 'legendary', icon: Trophy, art: '/cards/sessions_250.png', metric: s => s.total, target: 250, unit: 'séances' },
  { id: 'streak_7', name: 'Lancé', cond: '7 jours d’affilée', rarity: 'rare', icon: Flame, art: '/cards/streak_7.png', metric: s => s.streak, target: 7, unit: 'j' },
  { id: 'streak_30', name: 'Discipline de Fer', cond: '30 jours d’affilée', rarity: 'epic', icon: Flame, art: '/cards/streak_30.png', metric: s => s.streak, target: 30, unit: 'j' },
  { id: 'streak_100', name: 'Inarrêtable', cond: '100 jours d’affilée', rarity: 'legendary', icon: Flame, art: '/cards/streak_100.png', metric: s => s.streak, target: 100, unit: 'j' },

  // — Force : Squat —
  { id: 'squat_60', name: 'Apprenti Squat', cond: 'Squat ≥ 60 kg', rarity: 'rare', icon: Dumbbell, art: '/cards/squat_60.png', metric: s => s.maxWeight(['squat']), target: 60, unit: 'kg' },
  { id: 'squat_100', name: 'Maître du Squat', cond: 'Squat ≥ 100 kg', rarity: 'epic', icon: Dumbbell, art: '/cards/squat_100.png', metric: s => s.maxWeight(['squat']), target: 100, unit: 'kg' },
  { id: 'squat_140', name: 'Titan des Cuisses', cond: 'Squat ≥ 140 kg', rarity: 'legendary', icon: Mountain, art: '/cards/squat_140.png', metric: s => s.maxWeight(['squat']), target: 140, unit: 'kg' },

  // — Force : Bench —
  { id: 'bench_40', name: 'Premier Développé', cond: 'Développé couché ≥ 40 kg', rarity: 'rare', icon: Dumbbell, art: '/cards/bench_40.png', metric: s => s.maxWeight(BENCH), target: 40, unit: 'kg' },
  { id: 'bench_60', name: 'Pousseur', cond: 'Développé couché ≥ 60 kg', rarity: 'rare', icon: Dumbbell, art: '/cards/bench_60.png', metric: s => s.maxWeight(BENCH), target: 60, unit: 'kg' },
  { id: 'bench_80', name: 'Roi du Bench', cond: 'Développé couché ≥ 80 kg', rarity: 'epic', icon: Zap, art: '/cards/bench_80.png', metric: s => s.maxWeight(BENCH), target: 80, unit: 'kg' },
  { id: 'bench_100', name: 'Club des 100', cond: 'Développé couché ≥ 100 kg', rarity: 'legendary', icon: Crown, art: '/cards/bench_100.png', metric: s => s.maxWeight(BENCH), target: 100, unit: 'kg' },

  // — Force : Deadlift —
  { id: 'dead_80', name: 'Souleveur', cond: 'Soulevé de terre ≥ 80 kg', rarity: 'rare', icon: Dumbbell, art: '/cards/dead_80.png', metric: s => s.maxWeight(DEAD), target: 80, unit: 'kg' },
  { id: 'dead_120', name: 'Force Brute', cond: 'Soulevé de terre ≥ 120 kg', rarity: 'epic', icon: Zap, art: '/cards/dead_120.png', metric: s => s.maxWeight(DEAD), target: 120, unit: 'kg' },
  { id: 'dead_180', name: 'Arrache-Terre', cond: 'Soulevé de terre ≥ 180 kg', rarity: 'legendary', icon: Mountain, art: '/cards/dead_180.png', metric: s => s.maxWeight(DEAD), target: 180, unit: 'kg' },

  // — Force : Épaules + combos —
  { id: 'ohp_40', name: 'Épaules d’Acier', cond: 'Développé militaire ≥ 40 kg', rarity: 'rare', icon: Shield, art: '/cards/ohp_40.png', metric: s => s.maxWeight(OHP), target: 40, unit: 'kg' },
  { id: 'ohp_60', name: 'Presse Militaire', cond: 'Développé militaire ≥ 60 kg', rarity: 'epic', icon: Shield, art: '/cards/ohp_60.png', metric: s => s.maxWeight(OHP), target: 60, unit: 'kg' },
  { id: 'big_three', name: 'Les Trois Grands', cond: 'Squat + Bench + Deadlift', rarity: 'epic', icon: Swords, art: '/cards/big_three.png', metric: s => s.bigThreeCount, target: 3, unit: 'count' },
  { id: 'elite_total', name: 'Élite Powerlifting', cond: 'Total S+B+D ≥ 400 kg', rarity: 'legendary', icon: Crown, art: '/cards/elite_total.png', metric: s => s.eliteTotal, target: 400, unit: 'kg' },

  // — Volume —
  { id: 'vol_chest', name: 'Sculpteur de Pecs', cond: 'Volume pec ≥ 50 T', rarity: 'rare', icon: Activity, art: '/cards/vol_chest.png', metric: s => s.volumeByType('pec'), target: 50_000, unit: 'T' },
  { id: 'vol_back', name: 'Aile de Dragon', cond: 'Volume dos ≥ 50 T', rarity: 'rare', icon: Activity, art: '/cards/vol_back.png', metric: s => s.volumeByType('dos'), target: 50_000, unit: 'T' },
  { id: 'vol_arms', name: 'Bras de Titan', cond: 'Volume bras ≥ 30 T', rarity: 'rare', icon: Activity, art: '/cards/vol_arms.png', metric: s => s.volumeByType('bras'), target: 30_000, unit: 'T' },
  { id: 'vol_legs', name: 'Légende du Leg Day', cond: 'Volume jambes ≥ 100 T', rarity: 'epic', icon: Activity, art: '/cards/vol_legs.png', metric: s => s.volumeByType('jambes'), target: 100_000, unit: 'T' },
  { id: 'vol_total', name: 'Million de Kilos', cond: 'Volume total ≥ 1000 T', rarity: 'legendary', icon: Gem, art: '/cards/vol_total.png', metric: s => s.totalVolume, target: 1_000_000, unit: 'T' },

  // — Endurance / reps —
  { id: 'dips_session_50', name: 'Destructeur de Dips', cond: '50 dips en une séance', rarity: 'rare', icon: TrendingUp, art: '/cards/dips_session_50.png', metric: s => s.maxRepsInSession('dip'), target: 50, unit: 'reps' },
  { id: 'pullups_session_50', name: 'Machine à Tractions', cond: '50 tractions en une séance', rarity: 'epic', icon: TrendingUp, art: '/cards/pullups_session_50.png', metric: s => s.maxRepsInSession('traction'), target: 50, unit: 'reps' },
  { id: 'pullups_total_1000', name: 'Mille Tractions', cond: '1 000 tractions au total', rarity: 'epic', icon: Repeat, art: '/cards/pullups_total_1000.png', metric: s => s.repsForKeyword('traction'), target: 1000, unit: 'reps' },
  { id: 'pushups_total_1000', name: 'Mille Pompes', cond: '1 000 pompes au total', rarity: 'rare', icon: Repeat, art: '/cards/pushups_total_1000.png', metric: s => s.repsForKeyword('push'), target: 1000, unit: 'reps' },
  { id: 'reps_total_10000', name: 'Marathonien de la Fonte', cond: '10 000 répétitions au total', rarity: 'epic', icon: Rocket, art: '/cards/reps_total_10000.png', metric: s => s.totalReps, target: 10_000, unit: 'reps' },

  // — Variété / cardio —
  { id: 'variety_20', name: 'Explorateur', cond: '20 exercices différents', rarity: 'rare', icon: Target, art: '/cards/variety_20.png', metric: s => s.distinctExercises, target: 20, unit: 'count' },
  { id: 'variety_40', name: 'Touche-à-Tout', cond: '40 exercices différents', rarity: 'epic', icon: Target, art: '/cards/variety_40.png', metric: s => s.distinctExercises, target: 40, unit: 'count' },
  { id: 'all_muscles', name: 'Équilibre Parfait', cond: 'Tous les groupes musculaires', rarity: 'rare', icon: Sparkles, art: '/cards/all_muscles.png', metric: s => s.mainMuscleGroups, target: 4, unit: 'count' },
  { id: 'cardio_10', name: 'Cœur d’Athlète', cond: '10 séances cardio', rarity: 'rare', icon: Heart, art: '/cards/cardio_10.png', metric: s => s.sessionsOfType('cardio'), target: 10, unit: 'séances' },
  { id: 'legday_25', name: 'Jamais Sans Mes Jambes', cond: '25 séances de jambes', rarity: 'epic', icon: Bike, art: '/cards/legday_25.png', metric: s => s.sessionsOfType('jambes'), target: 25, unit: 'séances' },
  { id: 'cardio_legend', name: 'Endurance Légendaire', cond: '50 séances cardio', rarity: 'legendary', icon: PersonStanding, art: '/cards/cardio_legend.png', metric: s => s.sessionsOfType('cardio'), target: 50, unit: 'séances' },
]

// ── Progress + unlock ──────────────────────────────────────────────────────────
export interface CardProgress { current: number; target: number; pct: number; unlocked: boolean; label: string }

function formatProgress(current: number, target: number, unit: GymCard['unit']): string {
  switch (unit) {
    case 'kg':       return `${Math.round(current)} / ${target} kg`
    case 'T':        return `${(current / 1000).toFixed(current < 100_000 ? 1 : 0)} / ${target / 1000} T`
    case 'reps':     return `${Math.round(current).toLocaleString('fr-FR')} / ${target.toLocaleString('fr-FR')}`
    case 'séances':  return `${current} / ${target} séances`
    case 'j':        return `${current} / ${target} j`
    case 'count':    return `${current} / ${target}`
  }
}

export function cardProgress(card: GymCard, stats: CardStats): CardProgress {
  const current = card.metric(stats)
  const pct = Math.min(100, Math.round((current / card.target) * 100))
  return { current, target: card.target, pct, unlocked: current >= card.target, label: formatProgress(current, card.target, card.unit) }
}

/** IDs of cards now earned that weren't already unlocked. */
export function checkUnlocks(sessions: Session[], currentUnlocked: Set<string>): string[] {
  const stats = deriveStats(sessions)
  return CARDS.filter(c => !currentUnlocked.has(c.id) && c.metric(stats) >= c.target).map(c => c.id)
}
