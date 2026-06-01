import { NextRequest, NextResponse } from 'next/server'
import { streamText, Output } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { Session } from '@/types'
import { getRequestUser } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { personalBests } from '@/lib/stats'
import { sessionSchema } from '@/lib/ai-schemas'

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
- Exercices au poids du corps (pompes, tractions, dips, burpees...) → weight: 0
- Adapte les poids aux records personnels
- 3 à 6 exercices, 2 à 4 séries selon la durée demandée
- Si l'utilisateur demande "moitié de séance" ou "court" → 3 exercices, 3 séries max
- Utilise les noms d'exercices en français${includePastNotes ? '\n- Prends en compte les notes des séances passées (douleurs, fatigue, préférences)' : ''}`

  const userMessage = [
    `Demande: ${prompt}`,
    (notes || '').trim() ? `Notes importantes pour aujourd'hui (PRIORITÉ ABSOLUE): ${notes}` : '',
  ].filter(Boolean).join('\n')

  const google = createGoogleGenerativeAI({ apiKey })
  const result = streamText({
    model: google(process.env.GEMINI_MODEL || 'gemini-2.5-flash'),
    system: systemPrompt,
    prompt: userMessage,
    output: Output.object({ schema: sessionSchema }),
    temperature: 0.7,
  })

  // Streams the partial JSON object; the client (useObject) renders exercises
  // as they arrive.
  return result.toTextStreamResponse()
}
