// Rest-timer audio helper — Web Audio API.
//
// Uses AudioContext + OscillatorNode instead of HTMLAudioElement to avoid
// the iOS PWA ghost-sound bug: on iOS, a pending el.play() promise gets
// queued by the OS and fires on the next user gesture after the app is
// foregrounded. OscillatorNode nodes are created fresh for each beep and
// have no persistent promise state, so there is nothing to queue.

let ctx: AudioContext | null = null
let scheduledTimeout: number | null = null
let expectedBeepAt: number | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return ctx
}

// Must be called from a user gesture (touchstart / click) to satisfy iOS
// audio policy. After this the context stays 'running' until the app is
// backgrounded, at which point iOS suspends it automatically.
export function unlockAudio() {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') {
    c.resume().catch(() => {})
  }
}

function doPlayBeep() {
  const c = getCtx()
  // Context is 'suspended' when the PWA is backgrounded — returning here
  // prevents ghost sounds when expired setTimeout callbacks fire on resume.
  if (!c || c.state !== 'running') return

  try {
    const now = c.currentTime
    // Two-tone chime: 880 Hz then 1100 Hz, 120 ms apart
    ;([880, 1100] as const).forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.38, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      osc.start(t)
      osc.stop(t + 0.45)
    })
  } catch {}
}

export function playBeep() {
  // Stale beep: fired late because iOS resumed a suspended PWA
  if (expectedBeepAt !== null && Date.now() - expectedBeepAt > 1000) {
    expectedBeepAt = null
    return
  }
  expectedBeepAt = null
  doPlayBeep()
}

export function scheduleBeep(delayMs: number) {
  cancelScheduledBeep()
  unlockAudio()
  expectedBeepAt = Date.now() + delayMs
  if (delayMs <= 0) {
    playBeep()
    return
  }
  scheduledTimeout = window.setTimeout(() => {
    scheduledTimeout = null
    playBeep()
  }, delayMs)
}

export function cancelScheduledBeep() {
  if (scheduledTimeout !== null) {
    window.clearTimeout(scheduledTimeout)
    scheduledTimeout = null
  }
  expectedBeepAt = null
}

export function testBeep() {
  unlockAudio()
  window.setTimeout(playBeep, 50)
}
