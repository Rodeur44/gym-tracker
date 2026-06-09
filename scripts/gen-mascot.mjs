// One-off: generate the GymLog polar-bear mascot reference image.
// Usage: node scripts/gen-mascot.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://cloud.leonardo.ai/api/rest/v1'
const KEY = (readFileSync(join(ROOT, '.env.local'), 'utf8').match(/^LEONARDO_API_KEY=(.+)$/m) || [])[1].trim()
const headers = { accept: 'application/json', 'content-type': 'application/json', authorization: `Bearer ${KEY}` }
const sleep = ms => new Promise(r => setTimeout(r, ms))

const PROMPT =
  'a friendly but powerful muscular anthropomorphic polar bear mascot, fluffy ' +
  'white fur, strong athletic body, confident heroic pose, full body, dark moody ' +
  'background, dramatic violet and purple rim lighting, premium collectible ' +
  'trading card art, painterly, highly detailed, cinematic, centered composition'
const NEGATIVE = 'text, words, letters, watermark, logo, border, frame, ui, low quality, blurry, deformed'

const res = await fetch(`${API}/generations`, {
  method: 'POST', headers,
  body: JSON.stringify({
    prompt: PROMPT, negative_prompt: NEGATIVE,
    modelId: '7b592283-e8a7-4c5a-9ba6-d18c31f258b9',
    styleUUID: '111dc692-d470-4eec-b791-3475abac4c46',
    width: 832, height: 1248, num_images: 2, alchemy: false, ultra: false, contrast: 3.5,
  }),
})
const json = await res.json()
const id = json?.sdGenerationJob?.generationId
if (!id) { console.error(JSON.stringify(json)); process.exit(1) }
console.log('génération', id, '…')
for (let i = 0; i < 40; i++) {
  await sleep(3000)
  const r = await fetch(`${API}/generations/${id}`, { headers })
  const g = (await r.json())?.generations_by_pk
  if (g?.status === 'COMPLETE') {
    mkdirSync(join(ROOT, 'public', 'mascot'), { recursive: true })
    for (let k = 0; k < g.generated_images.length; k++) {
      const buf = Buffer.from(await (await fetch(g.generated_images[k].url)).arrayBuffer())
      writeFileSync(join(ROOT, 'public', 'mascot', `hero-${k + 1}.png`), buf)
      console.log('✓ public/mascot/hero-' + (k + 1) + '.png')
    }
    process.exit(0)
  }
  if (g?.status === 'FAILED') { console.error('FAILED'); process.exit(1) }
}
console.error('timeout')
