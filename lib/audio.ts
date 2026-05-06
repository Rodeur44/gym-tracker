// Rest-timer audio helper — uses HTML5 <audio> with the iOS unlock pattern.
//
// iOS Safari only allows audio playback after a user gesture has called
// .play() on the element at least once. After that initial unlock, any
// future .play() call works (including from setTimeout / outside gestures).

let audio: HTMLAudioElement | null = null
let unlocked = false
let scheduledTimeout: number | null = null
let expectedBeepAt: number | null = null

const SOURCE = '/sounds/timer-end.wav'

// When the PWA is foregrounded after suspension, iOS fires any expired
// setTimeout callbacks immediately, but the audio context is still suspended.
// The pending play() then executes on the first user gesture — a ghost sound.
//
// Fix: on visibilitychange → visible we (a) cancel stale scheduled beeps and
// (b) pause/reset the audio element which aborts any iOS-queued play() promise.
// Both actions fire before the pending timer callbacks in the event loop.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    const now = Date.now()
    // Cancel scheduled beep if it already expired
    if (expectedBeepAt !== null && now > expectedBeepAt + 500) {
      cancelScheduledBeep()
    }
    // Pause+reset the element — this aborts any pending iOS play() promise
    // so the audio cannot play on the next user gesture
    if (audio) {
      try { audio.pause(); audio.currentTime = 0 } catch {}
    }
  })
}

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
  el.volume = 0
  const promise = el.play()
  if (promise && typeof promise.then === 'function') {
    promise.then(() => {
      el.pause()
      el.currentTime = 0
      el.volume = 1
      unlocked = true
    }).catch(() => {
      el.volume = 1
    })
  } else {
    el.pause()
    el.currentTime = 0
    el.volume = 1
    unlocked = true
  }
}

// Play immediately (used by Test button + scheduled callbacks).
export function playBeep() {
  // Skip stale beeps: fired late because iOS resumed a suspended PWA.
  if (expectedBeepAt !== null && Date.now() - expectedBeepAt > 1000) {
    expectedBeepAt = null
    return
  }
  expectedBeepAt = null
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

// Test play (Tester le son button) — also unlocks if needed.
export function testBeep() {
  unlockAudio()
  // Slight delay so the unlock-pause settles before the test play
  window.setTimeout(playBeep, 50)
}
