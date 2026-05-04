// One-shot script: generates a 3-tone ascending beep used by the rest timer.
// Output: public/sounds/timer-end.wav (mono, 16-bit PCM, 44.1 kHz, ~750ms)
//
// Run with: node scripts/generate-beep.mjs

import fs from 'node:fs'
import path from 'node:path'

const sampleRate = 44100
const totalDuration = 0.78
const totalSamples = Math.floor(sampleRate * totalDuration)

// 3 ascending tones — clear, distinctive, ends loud
const beeps = [
  { freq: 880, start: 0.00, duration: 0.16 },  // A5
  { freq: 1100, start: 0.18, duration: 0.16 }, // C#6 (close)
  { freq: 1320, start: 0.36, duration: 0.32 }, // E6 (longer, sustains the alert)
]

function envelope(t, dur) {
  const attack = 0.006   // 6ms attack — avoids click
  const release = 0.06   // 60ms release — smooth tail
  if (t < attack) return t / attack
  if (t > dur - release) return Math.max(0, (dur - t) / release)
  return 1
}

const buffer = Buffer.alloc(44 + totalSamples * 2)

// WAV header (mono, 16-bit PCM, 44.1 kHz)
buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + totalSamples * 2, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16)
buffer.writeUInt16LE(1, 20)   // PCM
buffer.writeUInt16LE(1, 22)   // mono
buffer.writeUInt32LE(sampleRate, 24)
buffer.writeUInt32LE(sampleRate * 2, 28)
buffer.writeUInt16LE(2, 32)
buffer.writeUInt16LE(16, 34)
buffer.write('data', 36)
buffer.writeUInt32LE(totalSamples * 2, 40)

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate
  let sample = 0
  for (const b of beeps) {
    if (t >= b.start && t < b.start + b.duration) {
      const localT = t - b.start
      const env = envelope(localT, b.duration)
      // Mix with a tiny bit of square-wave harmonic for cut-through
      const fundamental = Math.sin(2 * Math.PI * b.freq * t)
      const harmonic = Math.sin(2 * Math.PI * b.freq * 2 * t) * 0.12
      sample += (fundamental + harmonic) * env * 0.55
    }
  }
  sample = Math.max(-0.95, Math.min(0.95, sample))
  buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
}

const outDir = path.join(process.cwd(), 'public', 'sounds')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'timer-end.wav')
fs.writeFileSync(outPath, buffer)
console.log(`Generated ${outPath} (${buffer.length} bytes, ${totalDuration.toFixed(2)}s)`)
