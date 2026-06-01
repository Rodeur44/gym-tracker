import { z } from 'zod'

// Schémas partagés client ↔ serveur pour la génération IA en streaming.
// Le client (useObject) et la route (Output.object) utilisent le MÊME schéma
// pour garantir que les objets partiels streamés correspondent à l'UI.
//
// Tolérance : z.coerce.number() accepte aussi bien 60 que "60" — Gemini renvoie
// parfois un nombre sous forme de texte, ce qui faisait échouer la validation
// (et donc le message « réessaie »). Les champs non essentiels sont optionnels.

const intCoerce = z.coerce.number().int()
const numCoerce = z.coerce.number()

// /api/ai/program — séance structurée (depuis un formulaire)
export const programSchema = z.object({
  title: z.string().describe('Nom court de la séance, ex: "Push lourd · Force"').optional(),
  summary: z.string().describe('Une phrase qui décrit l\'esprit de la séance').optional(),
  exercises: z.array(
    z.object({
      name: z.string().describe('Nom français standard, ex: Développé couché'),
      sets: intCoerce.describe('Nombre de séries (2 à 5)'),
      reps: intCoerce.describe('Répétitions par série (4 à 20)'),
      rest_sec: intCoerce.describe('Repos en secondes (30 à 240)'),
      notes: z.string().describe('Conseil court (tempo, range, focus), max 60 caractères').optional(),
    }),
  ).describe('4 à 7 exercices, ordre composé → isolation'),
})
export type ProgramResult = z.infer<typeof programSchema>

// /api/ai/session — séance prête à logger (depuis un prompt libre)
export const sessionSchema = z.object({
  type: z.enum(['pec', 'dos', 'bras', 'jambes', 'cardio']).optional(),
  exos: z.array(
    z.object({
      name: z.string(),
      sets: z.array(
        z.object({
          weight: numCoerce.describe('Poids en kg, 0 pour le poids du corps'),
          reps: intCoerce,
        }),
      ),
    }),
  ).describe('3 à 6 exercices'),
})
export type SessionResult = z.infer<typeof sessionSchema>
