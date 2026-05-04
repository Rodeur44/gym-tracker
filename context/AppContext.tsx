'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Session, MuscleGroup, Exercise } from '@/types'
import { MUSCLE_ORDER } from '@/lib/constants'
import { validatePromo } from '@/lib/promo'

// ── Unlock checker (pure, outside component) ─────────────────────
function checkUnlocks(allSessions: Session[], currentUnlocked: Set<string>): string[] {
  const newCards: string[] = []
  const has = (id: string) => currentUnlocked.has(id)

  const volumeForType = (type: MuscleGroup) =>
    allSessions
      .filter(s => s.type === type)
      .flatMap(s => s.exos.flatMap(e => e.sets))
      .reduce((acc, set) => acc + (set.weight || 0) * (set.reps || 0), 0)

  const totalRepsForKeyword = (keyword: string) =>
    allSessions
      .flatMap(s => s.exos.filter(e => e.name.toLowerCase().includes(keyword)))
      .flatMap(e => e.sets)
      .reduce((acc, set) => acc + (set.reps || 0), 0)

  const maxRepsInOneSession = (keyword: string) =>
    Math.max(0, ...allSessions.map(s =>
      s.exos
        .filter(e => e.name.toLowerCase().includes(keyword))
        .flatMap(e => e.sets)
        .reduce((acc, set) => acc + (set.reps || 0), 0)
    ))

  const computeStreak = () => {
    const dates = new Set(allSessions.map(s => s.date))
    let count = 0
    const d = new Date()
    if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
    while (true) {
      const ds = d.toISOString().slice(0, 10)
      if (dates.has(ds)) { count++; d.setDate(d.getDate() - 1) } else break
    }
    return count
  }

  const total = allSessions.length

  if (!has('consist_newbie') && total >= 1) newCards.push('consist_newbie')
  if (!has('consist_veteran') && total >= 100) newCards.push('consist_veteran')
  if (!has('consist_unstoppable') && computeStreak() >= 100) newCards.push('consist_unstoppable')

  if (!has('volume_chest') && volumeForType('pec') > 50_000) newCards.push('volume_chest')
  if (!has('volume_back') && totalRepsForKeyword('traction') >= 10_000) newCards.push('volume_back')
  if (!has('volume_legs') && volumeForType('jambes') > 150_000) newCards.push('volume_legs')
  if (!has('volume_arms') && volumeForType('bras') > 40_000) newCards.push('volume_arms')

  if (!has('reps_pullups') && maxRepsInOneSession('traction') >= 100) newCards.push('reps_pullups')
  if (!has('reps_dips') && maxRepsInOneSession('dip') >= 100) newCards.push('reps_dips')

  if (!has('goal_muscleup') && totalRepsForKeyword('muscle') >= 1) newCards.push('goal_muscleup')

  return newCards
}

interface AppContextValue {
  user: User | null
  sessions: Session[]
  unlockedCards: Set<string>
  loading: boolean
  // Log state
  currentExos: Exercise[]
  setCurrentExos: (exos: Exercise[]) => void
  logType: MuscleGroup
  setLogType: (t: MuscleGroup) => void
  editMode: boolean
  editSessionId: string | null
  startEdit: (id: string) => void
  cancelEdit: () => void
  repeatPending: boolean
  repeatSession: (session: Session) => void
  clearRepeat: () => void
  // Actions
  saveSession: (payload: Omit<Session, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>
  deleteSession: (id: string) => Promise<boolean>
  signOut: () => Promise<void>
  reload: () => Promise<void>
  // Utils
  getBest: (name: string) => number
  getStreak: () => number
  getNextType: () => MuscleGroup
  // Pro
  isPro: boolean
  unlockPro: (code: string) => boolean
  activatePro: () => void
  disablePro: () => void
  proOpen: boolean
  openPro: () => void
  closePro: () => void
  // Rest timer
  restActive: boolean
  restEndsAt: number | null
  restDuration: number
  startRest: (seconds?: number) => void
  stopRest: () => void
  addRest: (deltaSec: number) => void
  setDefaultRest: (seconds: number) => void
  testBeep: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [unlockedCards, setUnlockedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [currentExos, setCurrentExos] = useState<Exercise[]>([])
  const [logType, setLogType] = useState<MuscleGroup>('pec')
  const [editMode, setEditMode] = useState(false)
  const [editSessionId, setEditSessionId] = useState<string | null>(null)
  const [repeatPending, setRepeatPending] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [proOpen, setProOpen] = useState(false)
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [restDuration, setRestDuration] = useState(90)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const scheduledOscRef = useRef<OscillatorNode[]>([])

  const openPro = useCallback(() => setProOpen(true), [])
  const closePro = useCallback(() => setProOpen(false), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsPro(localStorage.getItem('gymlog_pro') === '1')
    const saved = parseInt(localStorage.getItem('gymlog_rest_default') || '', 10)
    if (!Number.isNaN(saved) && saved >= 15 && saved <= 600) setRestDuration(saved)
  }, [])

  const ensureAudio = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!audioCtxRef.current) {
      try {
        const Ctx = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || window.AudioContext
        if (!Ctx) return null
        audioCtxRef.current = new Ctx()
      } catch { return null }
    }
    const ctx = audioCtxRef.current
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  }, [])

  // Unlock the audio context on the first user gesture (iOS requirement)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const unlock = () => { ensureAudio() }
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('mousedown', unlock)
    return () => {
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('mousedown', unlock)
    }
  }, [ensureAudio])

  // Resume audio when the page becomes visible again (iOS suspends on background)
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handler = () => {
      if (document.visibilityState === 'visible') ensureAudio()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [ensureAudio])

  const cancelScheduledBeep = useCallback(() => {
    scheduledOscRef.current.forEach(osc => { try { osc.stop(0) } catch {} })
    scheduledOscRef.current = []
  }, [])

  const scheduleBeep = useCallback((secondsFromNow: number) => {
    cancelScheduledBeep()
    const ctx = ensureAudio()
    if (!ctx) return
    const t = ctx.currentTime + Math.max(0, secondsFromNow)
    const oscs: OscillatorNode[] = []
    const beep = (freq: number, when: number, dur = 0.16) => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, when)
        gain.gain.exponentialRampToValueAtTime(0.4, when + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(when)
        osc.stop(when + dur + 0.05)
        oscs.push(osc)
      } catch {}
    }
    beep(880, t)
    beep(1100, t + 0.18)
    beep(1320, t + 0.36, 0.24)
    scheduledOscRef.current = oscs
  }, [cancelScheduledBeep, ensureAudio])

  const startRest = useCallback((seconds?: number) => {
    const dur = seconds ?? restDuration
    // Schedule the end beep NOW while we're still in the user's tap event.
    // iOS needs the audio scheduling to happen inside the gesture context.
    scheduleBeep(dur)
    setRestEndsAt(Date.now() + dur * 1000)
  }, [restDuration, scheduleBeep])

  const stopRest = useCallback(() => {
    cancelScheduledBeep()
    setRestEndsAt(null)
  }, [cancelScheduledBeep])

  const addRest = useCallback((deltaSec: number) => {
    setRestEndsAt(prev => {
      if (!prev) return prev
      const next = Math.max(Date.now() + 1000, prev + deltaSec * 1000)
      // Reschedule the beep for the new end time
      scheduleBeep((next - Date.now()) / 1000)
      return next
    })
  }, [scheduleBeep])

  const testBeep = useCallback(() => {
    const ctx = ensureAudio()
    if (!ctx) return
    const t = ctx.currentTime + 0.05
    const beep = (freq: number, when: number, dur = 0.14) => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, when)
        gain.gain.exponentialRampToValueAtTime(0.4, when + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(when)
        osc.stop(when + dur + 0.05)
      } catch {}
    }
    beep(880, t)
    beep(1100, t + 0.16)
  }, [ensureAudio])

  const setDefaultRest = useCallback((seconds: number) => {
    const clamped = Math.max(15, Math.min(600, seconds))
    setRestDuration(clamped)
    if (typeof window !== 'undefined') localStorage.setItem('gymlog_rest_default', String(clamped))
  }, [])

  const restActive = restEndsAt !== null

  const activatePro = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.setItem('gymlog_pro', '1')
    setIsPro(true)
  }, [])

  const unlockPro = useCallback((code: string) => {
    if (!validatePromo(code)) return false
    activatePro()
    return true
  }, [activatePro])

  const disablePro = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem('gymlog_pro')
    setIsPro(false)
  }, [])

  const loadData = useCallback(async (userId: string) => {
    const [{ data: s }, { data: c }] = await Promise.all([
      sb.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      sb.from('user_cards').select('card_id').eq('user_id', userId),
    ])
    setSessions((s as Session[]) || [])
    setUnlockedCards(new Set((c || []).map((x: { card_id: string }) => x.card_id)))
  }, [sb])

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadData(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadData(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [loadData, sb.auth])

  const reload = useCallback(async () => {
    if (user) await loadData(user.id)
  }, [user, loadData])

  const getBest = useCallback((name: string) => {
    let best = 0
    sessions.forEach(s => (s.exos || []).forEach(e => {
      if (e.name !== name) return
      e.sets.forEach(set => { if ((set.weight || 0) > best) best = set.weight })
    }))
    return best
  }, [sessions])

  const getStreak = useCallback(() => {
    if (!sessions.length) return 0
    const dates = new Set(sessions.map(s => s.date))
    let streak = 0
    const d = new Date()
    if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
    while (true) {
      const ds = d.toISOString().slice(0, 10)
      if (dates.has(ds)) { streak++; d.setDate(d.getDate() - 1) } else break
    }
    return streak
  }, [sessions])

  const getNextType = useCallback((): MuscleGroup => {
    if (!sessions.length) return 'pec'
    return MUSCLE_ORDER[(MUSCLE_ORDER.indexOf(sessions[0].type as MuscleGroup) + 1) % MUSCLE_ORDER.length]
  }, [sessions])

  const saveSession = useCallback(async (payload: Omit<Session, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return false
    if (editMode && editSessionId) {
      // Optimistic: apply immediately, revert on error
      setSessions(prev => prev.map(s => s.id === editSessionId ? { ...s, ...payload } : s))
      setEditMode(false); setEditSessionId(null)
      const { error } = await sb.from('sessions').update(payload).eq('id', editSessionId).eq('user_id', user.id)
      if (error) { await loadData(user.id); return false }
      return true
    }
    // Optimistic: insert temp session immediately
    const tempId = `temp-${Date.now()}`
    const tempSession: Session = { ...payload, id: tempId, user_id: user.id, created_at: new Date().toISOString() }
    setSessions(prev => [tempSession, ...prev])
    const { data, error } = await sb.from('sessions').insert({ ...payload, user_id: user.id }).select().single()
    if (!error && data) {
      const savedSession = data as Session
      setSessions(prev => prev.map(s => s.id === tempId ? savedSession : s))

      // Check card unlocks against the updated sessions list
      const updatedSessions = [savedSession, ...sessions.filter(s => s.id !== tempId)]
      const newCards = checkUnlocks(updatedSessions, unlockedCards)
      if (newCards.length > 0) {
        setUnlockedCards(prev => new Set([...prev, ...newCards]))
        await sb.from('user_cards').insert(newCards.map(id => ({ user_id: user.id, card_id: id })))
      }

      return true
    }
    setSessions(prev => prev.filter(s => s.id !== tempId))
    return false
  }, [user, editMode, editSessionId, sb, loadData, sessions, unlockedCards])

  const deleteSession = useCallback(async (id: string) => {
    if (!user) return false
    // Optimistic: remove immediately, revert on error
    const snapshot = sessions.find(s => s.id === id)
    setSessions(prev => prev.filter(s => s.id !== id))
    const { error } = await sb.from('sessions').delete().eq('id', id).eq('user_id', user.id)
    if (error) {
      if (snapshot) setSessions(prev => [...prev, snapshot].sort((a, b) => b.date.localeCompare(a.date)))
      return false
    }
    return true
  }, [user, sessions, sb])

  const signOut = useCallback(async () => {
    await sb.auth.signOut()
    setUser(null); setSessions([]); setUnlockedCards(new Set())
  }, [sb])

  const startEdit = useCallback((id: string) => {
    const s = sessions.find(x => x.id === id)
    if (!s) return
    setEditMode(true); setEditSessionId(id)
    setCurrentExos(s.exos.map(e => ({
      name: e.name,
      sets: e.sets.map(st => ({ weight: st.weight || 0, reps: st.reps || 10 }))
    })))
    setLogType(s.type as MuscleGroup)
  }, [sessions])

  const cancelEdit = useCallback(() => {
    setEditMode(false); setEditSessionId(null); setCurrentExos([])
  }, [])

  const repeatSession = useCallback((session: Session) => {
    setLogType(session.type as MuscleGroup)
    setCurrentExos(session.exos.map(e => ({
      name: e.name,
      sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 10 }))
    })))
    setRepeatPending(true)
  }, [])

  const clearRepeat = useCallback(() => setRepeatPending(false), [])

  return (
    <AppContext.Provider value={{
      user, sessions, unlockedCards, loading,
      currentExos, setCurrentExos, logType, setLogType,
      editMode, editSessionId, startEdit, cancelEdit,
      repeatPending, repeatSession, clearRepeat,
      saveSession, deleteSession, signOut, reload,
      getBest, getStreak, getNextType,
      isPro, unlockPro, activatePro, disablePro,
      proOpen, openPro, closePro,
      restActive, restEndsAt, restDuration,
      startRest, stopRest, addRest, setDefaultRest, testBeep,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
