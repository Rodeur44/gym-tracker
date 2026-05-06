import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Type } from '@google/genai'

export const runtime = 'nodejs'
export const maxDuration = 30

type MuscleGroup = 'pec' | 'dos' | 'bras' | 'jambes' | 'cardio'
type Level = 'debutant' | 'intermediaire' | 'avance'
type Goal = 'force' | 'volume' | 'endurance' | 'perte_poids'
type Equipment = 'salle' | 'maison_basique' | 'maison_haltere'

interface Body {
  type: MuscleGroup
  level: Level
  goal: Goal
  duration: number
  equipment: Equipment
  notes?: string
}

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          sets: { type: Type.INTEGER },
          reps: { type: Type.INTEGER },
          rest_sec: { type: Type.INTEGER },
          notes: { type: Type.STRING },
        },
        required: ['name', 'sets', 'reps', 'rest_sec'],
      },
    },
  },
  required: ['title', 'exercises'],
}

const SYSTEM = `Tu es un coach de musculation expert francophone. Tu génères des séances précises, progressives et adaptées au niveau, à l'objectif et au matériel disponible. Reste concis. N'invente jamais d'exercices dangereux. Utilise des noms d'exercices français standards (Développé couché, Squat, Tractions, etc.).`

function buildPrompt(b: Body) {
  const lvl = { debutant: 'débutant', intermediaire: 'intermédiaire', avance: 'avancé' }[b.level]
  const goal = { force: 'force (lourd, peu de reps)', volume: 'hypertrophie / volume', endurance: 'endurance musculaire', perte_poids: 'perte de poids (haute intensité)' }[b.goal]
  const eq = { salle: 'salle complète (barres, machines, câbles)', maison_basique: 'maison sans matériel (poids du corps)', maison_haltere: 'maison avec haltères seulement' }[b.equipment]
  const groupLabel = { pec: 'pectoraux', dos: 'dos', bras: 'bras et épaules', jambes: 'jambes', cardio: 'cardio / conditionnement' }[b.type]

  return `Génère une séance de ${groupLabel} pour un pratiquant ${lvl}.
Objectif : ${goal}.
Durée cible : ~${b.duration} minutes.
Matériel : ${eq}.
${b.notes ? `Note de l'utilisateur : ${b.notes}` : ''}

Contraintes :
- 4 à 7 exercices, ordre logique (composé → isolation).
- sets entre 2 et 5, reps entre 4 et 20 selon objectif.
- rest_sec entre 30 et 240.
- Champ "notes" court (max 60 caractères) avec un conseil utile (tempo, range, focus).
- "summary" : 1 phrase qui décrit l'esprit de la séance.
- "title" : nom court (ex : "Push lourd · Force").`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'IA non configurée (GEMINI_API_KEY manquant côté serveur).' }, { status: 503 })
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const validType = ['pec', 'dos', 'bras', 'jambes', 'cardio'].includes(body.type)
  const validLevel = ['debutant', 'intermediaire', 'avance'].includes(body.level)
  const validGoal = ['force', 'volume', 'endurance', 'perte_poids'].includes(body.goal)
  const validEq = ['salle', 'maison_basique', 'maison_haltere'].includes(body.equipment)
  const validDur = Number.isFinite(body.duration) && body.duration >= 15 && body.duration <= 180
  if (!validType || !validLevel || !validGoal || !validEq || !validDur) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
  }
  if (body.notes && body.notes.length > 300) {
    return NextResponse.json({ error: 'Note trop longue.' }, { status: 400 })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: buildPrompt(body),
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: 'application/json',
        responseSchema: SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    const text = res.text
    if (!text) {
      return NextResponse.json({ error: 'Réponse IA vide. Réessaie.' }, { status: 502 })
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      // Gemini truncated the JSON (e.g. hit token limit mid-output). Return a
      // user-friendly message instead of crashing.
      return NextResponse.json(
        { error: 'La réponse IA était incomplète. Réessaie ou réduis la durée de séance.' },
        { status: 502 }
      )
    }
    return NextResponse.json(parsed, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur IA inconnue.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
