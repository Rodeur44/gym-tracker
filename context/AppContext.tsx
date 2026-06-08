'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { scheduleBeep, cancelScheduledBeep, testBeep as testBeepImpl, unlockAudio } from '@/lib/audio'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Session, MuscleGroup, Exercise, Measurement, MeasurementInput, GymCard } from '@/types'
import { MUSCLE_ORDER } from '@/lib/constants'
import { computeStreak, bestForExercise } from '@/lib/stats'
import { CARDS, checkUnlocks } from '@/lib/cards'

interface AppContextValue {
  user: User | null
  sessions: Session[]
  unlockedCards: Set<string>
  loading: boolean
  // Card reveal — cards freshly unlocked this session, awaiting their reveal moment
  revealQueue: GymCard[]
  dismissReveal: () => void
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
  unlockPro: (code: string) => Promise<boolean>
  activatePro: () => Promise<boolean>
  disablePro: () => Promise<void>
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
  // Measurements
  measurements: Measurement[]
  saveMeasurement: (payload: MeasurementInput, id?: string) => Promise<{ ok: boolean; error?: string }>
  deleteMeasurement: (id: string) => Promise<boolean>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [unlockedCards, setUnlockedCards] = useState<Set<string>>(new Set())
  const [revealQueue, setRevealQueue] = useState<GymCard[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
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

  const openPro = useCallback(() => setProOpen(true), [])
  const closePro = useCallback(() => setProOpen(false), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Cancel any beep left over from a suspended PWA session
    cancelScheduledBeep()
    const saved = parseInt(localStorage.getItem('gymlog_rest_default') || '', 10)
    if (!Number.isNaN(saved) && saved >= 15 && saved <= 600) setRestDuration(saved)
  }, [])

  // Unlock the audio element on the first user gesture (iOS requirement)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let done = false
    const unlock = () => {
      if (done) return
      done = true
      unlockAudio()
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('mousedown', unlock)
    }
    window.addEventListener('touchstart', unlock, { passive: true })
    window.addEventListener('mousedown', unlock)
    return () => {
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('mousedown', unlock)
    }
  }, [])

  // Programme une notif push de fin de repos (déclenchée même app fermée).
  // Best-effort : si l'utilisateur n'a pas activé les notifs, ça ne fait rien.
  const restTokenRef = useRef('')
  const scheduleRestPush = useCallback((seconds: number) => {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    restTokenRef.current = token
    fetch('/api/push/rest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds: Math.round(seconds), token }),
      keepalive: true,
    }).catch(() => {})
  }, [])
  const cancelRestPush = useCallback(() => {
    restTokenRef.current = ''
    fetch('/api/push/rest', { method: 'DELETE', keepalive: true }).catch(() => {})
  }, [])

  const startRest = useCallback((seconds?: number) => {
    const dur = seconds ?? restDuration
    // scheduleBeep also unlocks the audio element synchronously inside this
    // user gesture, then schedules a setTimeout for the end-of-rest beep.
    scheduleBeep(dur * 1000)
    setRestEndsAt(Date.now() + dur * 1000)
    scheduleRestPush(dur)
  }, [restDuration, scheduleRestPush])

  const stopRest = useCallback(() => {
    cancelScheduledBeep()
    setRestEndsAt(null)
    cancelRestPush()
  }, [cancelRestPush])

  const addRest = useCallback((deltaSec: number) => {
    setRestEndsAt(prev => {
      if (!prev) return prev
      const next = Math.max(Date.now() + 1000, prev + deltaSec * 1000)
      scheduleBeep(next - Date.now())
      scheduleRestPush((next - Date.now()) / 1000)
      return next
    })
  }, [scheduleRestPush])

  const testBeep = useCallback(() => {
    testBeepImpl()
  }, [])

  const setDefaultRest = useCallback((seconds: number) => {
    const clamped = Math.max(15, Math.min(600, seconds))
    setRestDuration(clamped)
    if (typeof window !== 'undefined') localStorage.setItem('gymlog_rest_default', String(clamped))
  }, [])

  const restActive = restEndsAt !== null

  // Grants Pro server-side (entitlement stored in app_metadata), then refreshes
  // the local session so the new JWT claim is picked up. `body` carries either
  // a promo code or the demo-payment intent.
  const grantPro = useCallback(async (body: { code?: string; demoPayment?: boolean }) => {
    const res = await fetch('/api/pro/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return false
    await sb.auth.refreshSession()
    setIsPro(true)
    return true
  }, [sb])

  const activatePro = useCallback(() => grantPro({ demoPayment: true }), [grantPro])

  const unlockPro = useCallback((code: string) => grantPro({ code }), [grantPro])

  const disablePro = useCallback(async () => {
    const res = await fetch('/api/pro/redeem', { method: 'DELETE' })
    if (res.ok) await sb.auth.refreshSession()
    setIsPro(false)
  }, [sb])

  const loadData = useCallback(async (userId: string) => {
    const [{ data: s }, { data: c }, { data: m, error: mErr }] = await Promise.all([
      sb.from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      sb.from('user_cards').select('card_id').eq('user_id', userId),
      sb.from('measurements').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ])
    const loadedSessions = (s as Session[]) || []
    const existingCards = new Set((c || []).map((x: { card_id: string }) => x.card_id))
    setSessions(loadedSessions)
    setUnlockedCards(existingCards)
    // Unlock cards earned from existing sessions (e.g. first load after feature was added)
    const newCards = checkUnlocks(loadedSessions, existingCards)
    if (newCards.length > 0) {
      await sb.from('user_cards').insert(newCards.map(id => ({ user_id: userId, card_id: id })))
      setUnlockedCards(new Set([...existingCards, ...newCards]))
    }
    // Tolerate the case where the measurements table hasn't been created yet
    if (mErr) setMeasurements([])
    else setMeasurements((m as Measurement[]) || [])
  }, [sb])

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsPro(session?.user?.app_metadata?.pro === true)
      if (session?.user) loadData(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsPro(session?.user?.app_metadata?.pro === true)
      if (session?.user) loadData(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [loadData, sb.auth])

  const reload = useCallback(async () => {
    if (user) await loadData(user.id)
  }, [user, loadData])

  const getBest = useCallback((name: string) => bestForExercise(sessions, name), [sessions])

  const getStreak = useCallback(() => computeStreak(sessions.map(s => s.date)), [sessions])

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
        // Queue the freshly-earned cards for their full-screen reveal moment.
        // Rarest first so the big payoff lands last.
        const order = { rare: 0, epic: 1, legendary: 2 } as const
        const earned = newCards
          .map(id => CARDS.find(c => c.id === id))
          .filter((c): c is GymCard => Boolean(c))
          .sort((a, b) => order[a.rarity] - order[b.rarity])
        setRevealQueue(prev => [...prev, ...earned])
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
    setUser(null); setSessions([]); setUnlockedCards(new Set()); setMeasurements([])
  }, [sb])

  const saveMeasurement = useCallback(async (payload: MeasurementInput, id?: string) => {
    if (!user) return { ok: false, error: 'Tu dois être connecté pour sauvegarder.' }

    const friendly = (e: { code?: string; message?: string }) => {
      if (e.code === '42P01' || /relation .* does not exist/i.test(e.message || '')) {
        return 'La table "measurements" n\'a pas encore été créée dans Supabase. Va dans le SQL Editor et exécute la migration que je t\'ai donnée, puis réessaie.'
      }
      if (e.code === '42501' || /permission denied/i.test(e.message || '')) {
        return 'Permission refusée par Supabase (RLS). Vérifie que les policies de la table measurements ont bien été créées.'
      }
      return e.message || 'Sauvegarde impossible. Vérifie ta connexion.'
    }

    if (id) {
      const before = measurements.find(m => m.id === id)
      setMeasurements(prev =>
        prev.map(m => m.id === id ? { ...m, ...payload } : m)
            .sort((a, b) => b.date.localeCompare(a.date))
      )
      const { error } = await sb.from('measurements').update(payload).eq('id', id).eq('user_id', user.id)
      if (error) {
        if (before) setMeasurements(prev => prev.map(m => m.id === id ? before : m))
        return { ok: false, error: friendly(error) }
      }
      return { ok: true }
    }

    const tempId = `temp-${Date.now()}`
    const temp: Measurement = {
      ...payload,
      id: tempId,
      user_id: user.id,
      created_at: new Date().toISOString(),
    }
    setMeasurements(prev => [temp, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    const { data, error } = await sb.from('measurements')
      .insert({ ...payload, user_id: user.id })
      .select().single()
    if (error || !data) {
      setMeasurements(prev => prev.filter(m => m.id !== tempId))
      return { ok: false, error: error ? friendly(error) : 'Aucune donnée renvoyée.' }
    }
    setMeasurements(prev =>
      prev.map(m => m.id === tempId ? (data as Measurement) : m)
          .sort((a, b) => b.date.localeCompare(a.date))
    )
    return { ok: true }
  }, [user, measurements, sb])

  const deleteMeasurement = useCallback(async (id: string) => {
    if (!user) return false
    const snapshot = measurements.find(m => m.id === id)
    setMeasurements(prev => prev.filter(m => m.id !== id))
    const { error } = await sb.from('measurements').delete().eq('id', id).eq('user_id', user.id)
    if (error) {
      if (snapshot) setMeasurements(prev => [snapshot, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
      return false
    }
    return true
  }, [user, measurements, sb])

  const startEdit = useCallback((id: string) => {
    const s = sessions.find(x => x.id === id)
    if (!s) return
    setEditMode(true); setEditSessionId(id)
    setCurrentExos(s.exos.map(e => ({
      name: e.name,
      type: (e.type ?? s.type) as MuscleGroup,
      note: e.note,
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
      type: (e.type ?? session.type) as MuscleGroup,
      note: e.note,
      sets: e.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 10 }))
    })))
    setRepeatPending(true)
  }, [])

  const clearRepeat = useCallback(() => setRepeatPending(false), [])

  const dismissReveal = useCallback(() => setRevealQueue(prev => prev.slice(1)), [])

  return (
    <AppContext.Provider value={{
      user, sessions, unlockedCards, loading,
      revealQueue, dismissReveal,
      currentExos, setCurrentExos, logType, setLogType,
      editMode, editSessionId, startEdit, cancelEdit,
      repeatPending, repeatSession, clearRepeat,
      saveSession, deleteSession, signOut, reload,
      getBest, getStreak, getNextType,
      isPro, unlockPro, activatePro, disablePro,
      proOpen, openPro, closePro,
      restActive, restEndsAt, restDuration,
      startRest, stopRest, addRest, setDefaultRest, testBeep,
      measurements, saveMeasurement, deleteMeasurement,
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
