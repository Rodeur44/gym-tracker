import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import type { Session, MuscleGroup, Exercise } from '@/types'
import { getRequestUser } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { personalBests } from '@/lib/stats'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  // Cap AI generations per user to protect the Gemini budget.
  const rl = rateLimit(`ai-session:${user.id}`, { limit: 20, windowSec: 3600 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Limite de générations atteinte. Réessaie plus tard.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'IA non configurée (GEMINI_API_KEY manquant côté serveur).' }, { status: 503 })
  }

  try {
    const { prompt, notes, includePastNotes, sessions } = await req.json() as {
      prompt: string
      notes: string
      includePastNotes: boolean
      sessions: Session[]
    }

    const bests = personalBests(sessions)

    const history = sessions.slice(0, 20).map(s => {
      const exosSummary = s.exos.map(e => {
        const max = Math.max(0, ...e.sets.map(st => st.weight || 0))
        return `${e.name} (${e.sets.length} séries${max > 0 ? `, max ${max}kg` : ', poids corps'})`
      }).join(', ')
      const notesPart = includePastNotes && s.notes ? ` | Note: "${s.notes}"` : ''
      return `- ${s.date} [${s.type}]${notesPart}: ${exosSummary}`
    }).join('\n')

    const bestsText = Object.entries(bests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([name, w]) => `${name}: ${w}kg`)
      .join(', ')

    const systemPrompt = `Tu es un coach sportif expert en musculation. Tu génères des séances personnalisées à partir d'une demande en langage naturel.

HISTORIQUE (20 dernières séances${includePastNotes ? ' — avec notes de ressenti' : ''}):
${history || 'Aucun historique disponible'}

RECORDS PERSONNELS:
${bestsText || 'Aucun record enregistré'}

TYPES: pec (poitrine/épaules/triceps), dos (dos/biceps), bras (bras/épaules), jambes, cardio

RÈGLES:
- Réponds UNIQUEMENT avec du JSON valide, sans markdown ni texte autour
- Exercices au poids du corps (pompes, tractions, dips, burpees...) → weight: 0
- Adapte les poids aux records personnels
- 3 à 6 exercices, 2 à 4 séries selon la durée demandée
- Si l'utilisateur demande "moitié de séance" ou "court" → 3 exercices, 3 séries max
- Utilise les noms d'exercices en français${includePastNotes ? '\n- Prends en compte les notes des séances passées (douleurs, fatigue, préférences)' : ''}

FORMAT STRICTEMENT:
{"type":"pec","exos":[{"name":"Pompes","sets":[{"weight":0,"reps":15},{"weight":0,"reps":12}]},{"name":"Développé couché","sets":[{"weight":60,"reps":10},{"weight":60,"reps":8}]}]}`

    const userMessage = [
      `Demande: ${prompt}`,
      notes.trim() ? `Notes importantes pour aujourd'hui (PRIORITÉ ABSOLUE): ${notes}` : '',
    ].filter(Boolean).join('\n')

    const ai = new GoogleGenAI({ apiKey })
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    })

    const raw = (result.text || '').trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Réponse invalide' }, { status: 500 })

    const parsed = JSON.parse(jsonMatch[0]) as { type: MuscleGroup; exos: Exercise[] }

    const validTypes: MuscleGroup[] = ['pec', 'dos', 'bras', 'jambes', 'cardio']
    if (!validTypes.includes(parsed.type)) parsed.type = 'pec'

    return NextResponse.json(parsed)
  } catch (e) {
    console.error('AI session error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
