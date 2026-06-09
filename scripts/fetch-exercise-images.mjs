// Map the app's French exercises to free-exercise-db (public domain) demo
// photos, download them to public/exercises/, and emit lib/exercise-images.ts.
// Run: node scripts/fetch-exercise-images.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'exercises')
const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'

// FR exercise -> ordered English keyword phrases (first match wins, shortest name).
const MAP = {
  'Développé couché': ['barbell bench press'],
  'Développé incliné': ['barbell incline bench press', 'incline bench press'],
  'Développé décliné': ['decline barbell bench press', 'decline bench press'],
  'Écarté haltères': ['dumbbell flyes', 'dumbbell fly'],
  'Écarté câble': ['cable crossover', 'cable fly'],
  'Pec deck': ['butterfly', 'machine fly', 'pec deck'],
  'Dips': ['dips - chest', 'dips'],
  'Push-up': ['pushups', 'push-up'],
  'Développé haltères couché': ['dumbbell bench press'],
  'Tractions': ['pullups'],
  'Tirage vertical': ['wide-grip lat pulldown', 'lat pulldown'],
  'Rowing barre': ['bent over barbell row'],
  'Rowing haltère': ['one-arm dumbbell row'],
  'Deadlift': ['barbell deadlift'],
  'Soulevé de terre': ['barbell deadlift'],
  'Tirage câble bas': ['seated cable rows', 'seated cable row'],
  'Pull-over': ['straight-arm dumbbell pullover', 'dumbbell pullover'],
  'Shrug': ['barbell shrug'],
  'Face pull': ['face pull'],
  'Curl haltères': ['dumbbell bicep curl', 'dumbbell curl'],
  'Curl barre': ['barbell curl'],
  'Curl marteau': ['hammer curls'],
  'Triceps corde': ['triceps pushdown - rope', 'triceps pushdown'],
  'Triceps barre': ['triceps pushdown - v-bar', 'triceps pushdown'],
  'Skullcrusher': ['ez-bar skullcrusher', 'lying triceps press'],
  'Overhead press': ['standing military press', 'overhead press'],
  'Développé militaire': ['standing military press', 'military press'],
  'Élévation latérale': ['side lateral raise'],
  'Élévation frontale': ['front dumbbell raise'],
  'Squat': ['barbell full squat', 'barbell squat'],
  'Leg press': ['leg press'],
  'Fentes': ['barbell lunge', 'dumbbell lunges'],
  'Romanian deadlift': ['romanian deadlift'],
  'Leg curl': ['lying leg curls'],
  'Leg extension': ['leg extensions'],
  'Mollets debout': ['standing calf raises'],
  'Mollets assis': ['seated calf raise'],
  'Hip thrust': ['barbell hip thrust'],
  'Bulgarian split squat': ['bulgarian split squat', 'one leg barbell squat'],
  'Course à pied': ['running, treadmill', 'running'],
  'Vélo': ['bicycling, stationary', 'bicycling'],
  'Rameur': ['rowing, stationary'],
  'Corde à sauter': ['rope jumping'],
  'Elliptique': ['elliptical trainer'],
}

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const j = await (await fetch(JSON_URL)).json()

function pick(keywords) {
  for (const k of keywords) {
    const hits = j.filter(e => e.name.toLowerCase().includes(k) && e.images?.length)
    if (hits.length) return hits.sort((a, b) => a.name.length - b.name.length)[0]
  }
  return null
}

mkdirSync(OUT, { recursive: true })
const out = {}
const missing = []
for (const [fr, kw] of Object.entries(MAP)) {
  const e = pick(kw)
  if (!e) { missing.push(fr); continue }
  const buf = Buffer.from(await (await fetch(RAW + e.images[0])).arrayBuffer())
  const file = `${slug(fr)}.jpg`
  writeFileSync(join(OUT, file), buf)
  out[fr] = `/exercises/${file}`
}

const body = `// Auto-généré par scripts/fetch-exercise-images.mjs — photos de démo (free-exercise-db, domaine public).
const norm = (s: string) => s.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim()

export const EXERCISE_IMAGES: Record<string, string> = ${JSON.stringify(out, null, 2)}

const BY_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(EXERCISE_IMAGES).map(([k, v]) => [norm(k), v]),
)

/** Photo de démo d'un exercice (match normalisé + repli par inclusion). null si aucune. */
export function exerciseImage(name: string): string | null {
  const n = norm(name)
  if (BY_NORM[n]) return BY_NORM[n]
  for (const [k, v] of Object.entries(BY_NORM)) if (n.includes(k) || k.includes(n)) return v
  return null
}
`
writeFileSync(join(ROOT, 'lib', 'exercise-images.ts'), body)
console.log(`matched ${Object.keys(out).length}/${Object.keys(MAP).length}` + (missing.length ? ` · sans photo: ${missing.join(', ')}` : ''))
