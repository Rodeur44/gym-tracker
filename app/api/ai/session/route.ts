import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Session, MuscleGroup, Exercise } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { prompt, notes, includePastNotes, sessions } = await req.json() as {
      prompt: string
      notes: string
      includePastNotes: boolean
      sessions: Session[]
    }

    const bests: Record<string, number> = {}
    for (const s of sessions) {
      for (const e of s.exos) {
        const max = Math.max(0, ...e.sets.map(st => st.weight || 0))
        if (max > 0 && (!bests[e.name] || max > bests[e.name])) bests[e.name] = max
      }
    }

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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const userMessage = [
      `Demande: ${prompt}`,
      notes.trim() ? `Notes importantes pour aujourd'hui (PRIORITÉ ABSOLUE): ${notes}` : '',
    ].filter(Boolean).join('\n')

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userMessage },
    ])

    const raw = result.response.text().trim()
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
