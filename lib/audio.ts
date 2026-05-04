// Rest-timer audio helper — uses HTML5 <audio> with the iOS unlock pattern.
//
// iOS Safari only allows audio playback after a user gesture has called
// .play() on the element at least once. After that initial unlock, any
// future .play() call works (including from setTimeout / outside gestures).

let audio: HTMLAudioElement | null = null
let unlocked = false
let scheduledTimeout: number | null = null

const SOURCE = '/sounds/timer-end.wav'

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!audio) {
    audio = new Audio(SOURCE)
    audio.preload = 'auto'
    audio.loop = false
    audio.volume = 1
  }
  return audio
}

// Unlock the audio element. Must be called from a user gesture (touchstart,
// click, etc.). Plays the file silently and immediately pauses to satisfy
// iOS's policy.
export function unlockAudio() {
  const el = getAudio()
  if (!el || unlocked) return
  el.muted = true
  const promise = el.play()
  if (promise && typeof promise.then === 'function') {
    promise.then(() => {
      el.pause()
      el.currentTime = 0
      el.muted = false
      unlocked = true
    }).catch(() => {
      // Autoplay rejected — try again next gesture
      el.muted = false
    })
  } else {
    // Older browsers — assume play succeeded synchronously
    el.pause()
    el.currentTime = 0
    el.muted = false
    unlocked = true
  }
}

// Play immediately (used by Test button + scheduled callbacks).
export function playBeep() {
  const el = getAudio()
  if (!el) return
  try {
    el.currentTime = 0
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  } catch {}
}

// Schedule the beep to fire after `delayMs`. Replaces any previous schedule.
// Must be called from a user gesture so the audio element is unlocked.
export function scheduleBeep(delayMs: number) {
  cancelScheduledBeep()
  unlockAudio()
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
}

// Test play (Tester le son button) — also unlocks if needed.
export function testBeep() {
  unlockAudio()
  // Slight delay so the unlock-pause settles before the test play
  window.setTimeout(playBeep, 50)
}
