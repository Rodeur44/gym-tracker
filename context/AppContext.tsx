'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Session, MuscleGroup, Exercise } from '@/types'
import { MUSCLE_ORDER } from '@/lib/constants'

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
