// Generate collectible-card illustrations via the Leonardo.ai REST API,
// using the GymLog polar-bear mascot as a Character Reference so the SAME
// bear appears on every card.
//
// Usage:
//   node scripts/generate-cards.mjs <id>      # one card (test), e.g. squat_140
//   node scripts/generate-cards.mjs --all     # all cards (skips ones already downloaded)
//   node scripts/generate-cards.mjs --force <id|--all>   # regenerate even if file exists
//
// Reads LEONARDO_API_KEY from .env.local. Images land in public/cards/<id>.png.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'cards')
const MASCOT = join(ROOT, 'public', 'mascot', 'hero-1.png')
const CHARREF_CACHE = join(ROOT, 'public', 'mascot', '.charref-id')
const API = 'https://cloud.leonardo.ai/api/rest/v1'

function loadKey() {
  if (process.env.LEONARDO_API_KEY) return process.env.LEONARDO_API_KEY
  const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
  const m = env.match(/^LEONARDO_API_KEY=(.+)$/m)
  if (!m) throw new Error('LEONARDO_API_KEY introuvable dans .env.local')
  return m[1].trim()
}
const KEY = loadKey()
const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  authorization: `Bearer ${KEY}`,
}

// ── Style anchor — identical for every card ──────────────────────────────────
const STYLE =
  'clean simple dark studio background, soft purple haze, glowing violet ring ' +
  'of light behind, dramatic violet and purple rim lighting, premium ' +
  'collectible trading card character art, painterly, highly detailed, ' +
  'cinematic, centered full-body composition, slight top headroom'
const NEGATIVE =
  'text, words, letters, watermark, signature, logo, border, frame, ui, low ' +
  'quality, blurry, deformed, extra limbs, human, person, man, woman'

const MODEL_ID = '7b592283-e8a7-4c5a-9ba6-d18c31f258b9'
const STYLE_UUID = '111dc692-d470-4eec-b791-3475abac4c46'
const WIDTH = 832
const HEIGHT = 1248 // 2:3

// Each card = the mascot performing the action.
// Single-subject actions only — no busy environments (keeps the clean look).
const SUBJECTS = {
  first_session: 'a muscular white polar bear mascot flexing proudly, motivated beginner',
  sessions_10: 'a muscular white polar bear mascot holding a gym bag, confident',
  sessions_50: 'a muscular white polar bear mascot standing proud, arms crossed',
  sessions_100: 'a muscular white polar bear mascot wearing a glowing medal',
  sessions_250: 'a muscular white polar bear mascot holding a golden trophy',
  streak_7: 'a muscular white polar bear mascot with a small flame aura, dynamic',
  streak_30: 'a muscular white polar bear mascot breaking an iron chain, fiery aura',
  streak_100: 'a muscular white polar bear mascot engulfed in roaring flames',
  squat_60: 'a muscular white polar bear mascot squatting a barbell, focused',
  squat_100: 'a muscular white polar bear mascot squatting a heavy barbell',
  squat_140: 'a muscular white polar bear mascot squatting an enormous barbell',
  bench_40: 'a muscular white polar bear mascot performing a bench press',
  bench_60: 'a muscular white polar bear mascot bench pressing with intensity',
  bench_80: 'a muscular white polar bear mascot bench pressing, crown of energy',
  bench_100: 'a muscular white polar bear mascot lifting a barbell, golden crown',
  dead_80: 'a muscular white polar bear mascot deadlifting a barbell',
  dead_120: 'a muscular white polar bear mascot deadlifting a heavy barbell, energy aura',
  dead_180: 'a muscular white polar bear mascot deadlifting a colossal barbell',
  ohp_40: 'a muscular white polar bear mascot doing an overhead barbell press',
  ohp_60: 'a muscular white polar bear mascot doing a strict overhead press',
  big_three: 'a muscular white polar bear mascot holding three crossed barbells',
  elite_total: 'a muscular white polar bear mascot wearing a golden crown, elite champion',
  vol_chest: 'a muscular white polar bear mascot flexing a massive chest',
  vol_back: 'a muscular white polar bear mascot flexing a huge back, arms wide',
  vol_arms: 'a muscular white polar bear mascot flexing gigantic biceps',
  vol_legs: 'a muscular white polar bear mascot showing enormous powerful legs',
  vol_total: 'a muscular white polar bear mascot lifting a glowing diamond barbell',
  dips_session_50: 'a muscular white polar bear mascot doing dips on parallel bars',
  pullups_session_50: 'a muscular white polar bear mascot doing a pull-up on a bar',
  pullups_total_1000: 'a muscular white polar bear mascot hanging from a pull-up bar, strong',
  pushups_total_1000: 'a muscular white polar bear mascot doing a push-up',
  reps_total_10000: 'a muscular white polar bear mascot mid-run carrying a dumbbell',
  variety_20: 'a muscular white polar bear mascot holding a kettlebell, versatile',
  variety_40: 'a muscular white polar bear mascot juggling dumbbell and kettlebell',
  all_muscles: 'a muscular white polar bear mascot in a balanced symmetrical flex',
  cardio_10: 'a muscular white polar bear mascot running, glowing heart',
  legday_25: 'a muscular white polar bear mascot with powerful legs, holding a barbell',
  cardio_legend: 'a muscular white polar bear mascot mid-sprint, energetic aura',
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Character reference: upload the mascot once, reuse its id ─────────────────
async function getCharRefId() {
  if (existsSync(CHARREF_CACHE)) return readFileSync(CHARREF_CACHE, 'utf8').trim()
  const res = await fetch(`${API}/init-image`, {
    method: 'POST', headers, body: JSON.stringify({ extension: 'png' }),
  })
  const json = await res.json()
  const u = json?.uploadInitImage
  if (!u) throw new Error(`init-image: ${JSON.stringify(json)}`)
  const fields = JSON.parse(u.fields)
  const form = new FormData()
  for (const [k, v] of Object.entries(fields)) form.append(k, v)
  form.append('file', new Blob([readFileSync(MASCOT)], { type: 'image/png' }), 'mascot.png')
  const up = await fetch(u.url, { method: 'POST', body: form }) // S3: no auth header
  if (!up.ok) throw new Error(`upload mascotte S3 ${up.status}`)
  writeFileSync(CHARREF_CACHE, u.id)
  console.log(`🐻 mascotte uploadée (charRef id ${u.id})`)
  return u.id
}

async function createGeneration(prompt, charRefId) {
  const res = await fetch(`${API}/generations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: `${prompt}, ${STYLE}`,
      negative_prompt: NEGATIVE,
      modelId: MODEL_ID,
      styleUUID: STYLE_UUID,
      width: WIDTH,
      height: HEIGHT,
      num_images: 1,
      alchemy: false,
      ultra: false,
      contrast: 3.5,
      // Character Reference (controlnets) isn't supported by this model; the
      // bear stays consistent via identical model + style + detailed prompt.
      ...(charRefId ? {} : {}),
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`POST /generations ${res.status}: ${JSON.stringify(json)}`)
  const id = json?.sdGenerationJob?.generationId
  if (!id) throw new Error(`Pas de generationId: ${JSON.stringify(json)}`)
  return id
}

async function waitForImage(id, { tries = 40, delay = 3000 } = {}) {
  for (let i = 0; i < tries; i++) {
    await sleep(delay)
    const res = await fetch(`${API}/generations/${id}`, { headers })
    const json = await res.json()
    const gen = json?.generations_by_pk
    if (gen?.status === 'COMPLETE') {
      const url = gen.generated_images?.[0]?.url
      if (!url) throw new Error(`COMPLETE sans image: ${JSON.stringify(gen)}`)
      return url
    }
    if (gen?.status === 'FAILED') throw new Error(`Génération FAILED (${id})`)
  }
  throw new Error(`Timeout en attente de la génération ${id}`)
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download ${res.status}`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

async function genOne(id, charRefId, force) {
  const subject = SUBJECTS[id]
  if (!subject) throw new Error(`Sujet inconnu: ${id}`)
  const dest = join(OUT_DIR, `${id}.png`)
  if (!force && existsSync(dest)) {
    console.log(`⏭  ${id} (déjà présent)`)
    return
  }
  process.stdout.write(`🎨 ${id} … `)
  const genId = await createGeneration(subject, charRefId)
  const url = await waitForImage(genId)
  await download(url, dest)
  console.log('✓')
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const rest = args.filter(a => a !== '--force')
  const ids = rest.includes('--all') ? Object.keys(SUBJECTS) : rest
  if (ids.length === 0) {
    console.log('Usage: node scripts/generate-cards.mjs <id> | --all  [--force]')
    process.exit(1)
  }
  const charRefId = null // Character Reference unsupported by this model — see note above
  void getCharRefId // kept for reference; not used
  console.log(`Génération de ${ids.length} carte(s)…\n`)
  for (const id of ids) {
    try {
      await genOne(id, charRefId, force)
    } catch (e) {
      console.log(`✗ ${id}: ${e.message}`)
    }
  }
  console.log('\nTerminé.')
}

main()
