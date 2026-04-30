'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Session, MuscleGroup, Exercise } from '@/types'
import { MUSCLE_ORDER } from '@/lib/constants'

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
      const { error } = await sb.from('sessions').update(payload).eq('id', editSessionId).eq('user_id', user.id)
      if (!error) {
        setSessions(prev => prev.map(s => s.id === editSessionId ? { ...s, ...payload } : s))
        setEditMode(false); setEditSessionId(null)
        return true
      }
      return false
    }
    const { data, error } = await sb.from('sessions').insert({ ...payload, user_id: user.id }).select().single()
    if (!error && data) {
      setSessions(prev => [data as Session, ...prev])
      return true
    }
    return false
  }, [user, editMode, editSessionId, sb])

  const deleteSession = useCallback(async (id: string) => {
    if (!user) return false
    const { error } = await sb.from('sessions').delete().eq('id', id).eq('user_id', user.id)
    if (!error) { setSessions(prev => prev.filter(s => s.id !== id)); return true }
    return false
  }, [user, sb])

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

  return (
    <AppContext.Provider value={{
      user, sessions, unlockedCards, loading,
      currentExos, setCurrentExos, logType, setLogType,
      editMode, editSessionId, startEdit, cancelEdit,
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
