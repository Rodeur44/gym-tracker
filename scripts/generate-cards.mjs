// Generate collectible-card illustrations via the Leonardo.ai REST API.
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
const API = 'https://cloud.leonardo.ai/api/rest/v1'

// ── API key ──────────────────────────────────────────────────────────────────
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

// ── Style anchor — kept identical for every card so the set stays consistent ──
const STYLE =
  'dark moody background, dramatic violet and purple rim lighting, premium ' +
  'collectible trading card art, painterly, highly detailed, cinematic, ' +
  'centered composition, slight top headroom'
const NEGATIVE =
  'text, words, letters, watermark, logo, border, frame, ui, low quality, ' +
  'blurry, deformed, extra limbs'

// Leonardo Phoenix model (from the official getting-started example) + a generic style.
const MODEL_ID = '7b592283-e8a7-4c5a-9ba6-d18c31f258b9'
const STYLE_UUID = '111dc692-d470-4eec-b791-3475abac4c46'
const WIDTH = 832
const HEIGHT = 1248 // 2:3

const SUBJECTS = {
  first_session: 'a motivated beginner athlete starting their very first workout',
  sessions_10: 'a regular gym-goer with a gym bag, a calendar of crossed-off days',
  sessions_50: 'a seasoned lifter standing like a marble pillar of the gym',
  sessions_100: 'a roman centurion warrior athlete with a glowing medal',
  sessions_250: 'a living-legend veteran powerlifter with a golden trophy aura',
  streak_7: 'an athlete sprinting with a small trailing flame, momentum',
  streak_30: 'a disciplined athlete breaking iron chains, steady fire',
  streak_100: 'an unstoppable athlete engulfed in roaring flames',
  squat_60: 'a young athlete squatting a moderate barbell, focused',
  squat_100: 'a strong athlete squatting a heavy loaded barbell',
  squat_140: 'a colossal titan squatting an enormous barbell, mountain backdrop',
  bench_40: 'an athlete performing their first bench press',
  bench_60: 'a determined athlete bench pressing with intensity',
  bench_80: 'a king-like athlete bench pressing, crown of energy',
  bench_100: 'an elite athlete bench pressing glowing heavy plates, royal crown',
  dead_80: 'an athlete deadlifting a barbell from the floor',
  dead_120: 'a powerful brutal deadlift releasing an energy shockwave',
  dead_180: 'a giant deadlift cracking the ground, earth-shattering power',
  ohp_40: 'an athlete doing an overhead press, steel shoulders, shield motif',
  ohp_60: 'a soldier-like athlete performing a strict military press',
  big_three: 'three crossed barbells forming a trinity emblem, swords motif',
  elite_total: 'an elite powerlifter on a podium with a glowing golden crown',
  vol_chest: 'a sculptor chiseling a massive marble-like chest, dust and light',
  vol_back: 'a muscular back spread wide like dragon wings',
  vol_arms: 'gigantic flexed titan arms, veins and power',
  vol_legs: 'a legend on the leg press with enormous powerful legs',
  vol_total: 'a towering mountain of weight plates, diamond aura',
  dips_session_50: 'an explosive athlete on parallel dip bars',
  pullups_session_50: 'a machine-like athlete doing pull-ups, motion blur of reps',
  pullups_total_1000: 'endless rows of pull-up bars stretching into the distance',
  pushups_total_1000: 'an athlete amid an endless field of push-ups',
  reps_total_10000: 'a marathon of iron, an endurance runner carrying weights',
  variety_20: 'an explorer athlete among many gym machines, compass motif',
  variety_40: 'a versatile athlete surrounded by varied training equipment',
  all_muscles: 'a perfectly balanced symmetrical physique, harmony motif',
  cardio_10: 'a runner with a glowing radiant heart, cardio energy',
  legday_25: 'a devoted leg-day athlete in a squat rack, powerful legs',
  cardio_legend: 'a legendary endurance runner with an infinite-stamina aura',
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function createGeneration(prompt) {
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
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
}

async function genOne(id, force) {
  const subject = SUBJECTS[id]
  if (!subject) throw new Error(`Sujet inconnu: ${id}`)
  const dest = join(OUT_DIR, `${id}.png`)
  if (!force && existsSync(dest)) {
    console.log(`⏭  ${id} (déjà présent)`)
    return
  }
  process.stdout.write(`🎨 ${id} … `)
  const genId = await createGeneration(subject)
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
  console.log(`Génération de ${ids.length} carte(s)…\n`)
  for (const id of ids) {
    try {
      await genOne(id, force)
    } catch (e) {
      console.log(`✗ ${id}: ${e.message}`)
    }
  }
  console.log('\nTerminé.')
}

main()
