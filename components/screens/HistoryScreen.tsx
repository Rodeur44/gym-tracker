'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, Pencil, RotateCcw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { TYPE_LBL, TAG_CLR, TAG_BG } from '@/lib/constants'
import type { MuscleGroup, Session } from '@/types'
import EmptyState from '@/components/ui/EmptyState'
import { sessionMuscleGroups } from '@/lib/stats'

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtWeekday(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '').toUpperCase()
}

function fmtDay(d: string) {
  return new Date(d + 'T12:00:00').getDate().toString().padStart(2, '0')
}

function calcVolume(s: Session): number {
  return s.exos.reduce((acc, e) =>
    acc + e.sets.reduce((a, st) => a + (st.weight || 0) * (st.reps || 0), 0), 0)
}

function fmtVol(vol: number): string {
  if (vol === 0) return '—'
  return vol >= 1000 ? `${(vol / 1000).toFixed(1)}T` : `${vol}kg`
}

function DetailModal({ session, onClose, onEdit, onDelete, onRepeat }: {
  session: Session
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onRepeat: () => void
}) {
  const groups = sessionMuscleGroups(session) as MuscleGroup[]
  // Suppression en deux temps : jamais de perte de données sur un seul tap.
  const [confirming, setConfirming] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl flex flex-col"
        style={{ maxHeight: 'calc(80vh - 80px)', marginBottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex-shrink-0 px-6 pt-5 pb-4">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {groups.map(g => (
                <span key={g} className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                  style={{ color: TAG_CLR[g], background: TAG_BG[g], borderColor: `${TAG_CLR[g]}33` }}>
                  {TYPE_LBL[g]}
                </span>
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-mono flex-shrink-0">{fmtDate(session.date)}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="flex flex-col gap-1">
            {(session.exos || []).map((e, i) => {
              const eClr = TAG_CLR[(e.type ?? session.type) as MuscleGroup]
              return (
                <div key={i} className="py-3 border-b border-white/[0.05] last:border-none">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: eClr, boxShadow: `0 0 6px ${eClr}88` }} />
                      <span className="text-sm font-medium text-zinc-200 truncate">{e.name}</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-500 flex-shrink-0">{e.sets.length} série{e.sets.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {e.sets.map((s, si) => (
                      <span key={si} className="text-[11px] font-mono bg-[#1C1C1C] border border-white/[0.06] px-2.5 py-1 rounded-lg text-zinc-400">
                        {s.weight > 0 ? `${s.weight}kg` : 'corps'} × {s.reps}
                      </span>
                    ))}
                  </div>
                  {e.note && (
                    <p className="text-[12px] text-zinc-500 mt-2 leading-relaxed italic">« {e.note} »</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-shrink-0 px-6 pt-3 pb-6 border-t border-white/[0.05] flex flex-col gap-2">
          {confirming ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <p className="text-sm text-zinc-300 text-center py-1">
                Supprimer la séance du <span className="font-semibold text-white">{fmtDate(session.date)}</span> ?
                <span className="block text-[12px] text-red-400 mt-0.5">Cette action est définitive.</span>
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setConfirming(false)}
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold text-zinc-300 bg-white/[0.04] border border-white/[0.06]"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={onDelete}
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold text-white bg-red-500/85 border border-red-400/30 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} strokeWidth={1.8} /> Supprimer
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={onRepeat}
                className="w-full h-12 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5)' }}
              >
                <RotateCcw size={16} strokeWidth={1.8} /> Reprendre cette séance
              </motion.button>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => setConfirming(true)}
                  aria-label="Supprimer la séance"
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-400 bg-red-500/5 border border-red-500/15 active:bg-red-500/15 transition-colors"
                >
                  <Trash2 size={18} strokeWidth={1.8} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={onEdit}
                  className="flex-1 h-12 rounded-2xl text-sm font-semibold text-zinc-300 flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.06]"
                >
                  <Pencil size={16} strokeWidth={1.8} /> Modifier
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function HistoryScreen() {
  const { sessions, deleteSession, startEdit, repeatSession } = useApp()
  const [selected, setSelected] = useState<Session | null>(null)

  const grouped = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
    const map = new Map<string, Session[]>()
    sorted.forEach(s => {
      const d = new Date(s.date + 'T12:00:00')
      const key = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    })
    return Array.from(map.entries())
  }, [sessions])

  const totalVol = useMemo(() => fmtVol(sessions.reduce((acc, s) => acc + calcVolume(s), 0)), [sessions])

  async function handleDelete() {
    if (!selected) return
    await deleteSession(selected.id)
    setSelected(null)
  }

  function handleRepeat() {
    if (!selected) return
    repeatSession(selected)
    setSelected(null)
  }

  if (!sessions.length) {
    return (
      <EmptyState
        icon={Clock}
        title="Aucune séance"
        message="Enregistre ta première séance pour la voir apparaître ici."
      />
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-5 pb-28 flex flex-col gap-1"
      >
        {/* Header stats */}
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] flex items-center gap-2">
            <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
            {sessions.length} séance{sessions.length > 1 ? 's' : ''}
          </p>
          <span className="text-[11px] font-mono text-zinc-400">{totalVol} soulevés</span>
        </div>

        {/* Month groups */}
        {grouped.map(([month, monthSessions], gi) => {
          const monthVol = fmtVol(monthSessions.reduce((acc, s) => acc + calcVolume(s), 0))
          return (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5"
            >
              {/* Month header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[1.6px]">
                    {month.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.1)] text-[#A78BFA] border border-[rgba(139,92,246,0.2)]">
                    {monthSessions.length} séance{monthSessions.length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">Vol. {monthVol}</span>
              </div>

              {/* Sessions */}
              <div className="card-glass rounded-2xl overflow-hidden">
                {monthSessions.map((s, i) => {
                  const groups = sessionMuscleGroups(s) as MuscleGroup[]
                  const clr = TAG_CLR[groups[0]]
                  const seriesCount = s.exos.reduce((acc, e) => acc + e.sets.length, 0)
                  const vol = fmtVol(calcVolume(s))
                  return (
                    <motion.button
                      type="button"
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.06 + i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setSelected(s)}
                      className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-none cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-all w-full text-left"
                    >
                      {/* Color stripe — dégradé des groupes de la séance */}
                      <div
                        className="w-0.5 h-10 rounded-full flex-shrink-0"
                        style={{
                          background: groups.length > 1
                            ? `linear-gradient(180deg, ${groups.map(g => TAG_CLR[g]).join(', ')})`
                            : clr,
                          boxShadow: `0 0 10px ${clr}55`,
                        }}
                      />

                      {/* Date column */}
                      <div className="flex flex-col items-center w-8 flex-shrink-0">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">{fmtWeekday(s.date)}</span>
                        <span className="text-[18px] font-bold font-mono text-zinc-200 leading-tight">{fmtDay(s.date)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-zinc-100 tracking-tight truncate">
                          {groups.map(g => TYPE_LBL[g].split(' ')[0]).join(' · ')}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-zinc-400">{(s.exos || []).length} ex</span>
                          <span className="text-[11px] text-zinc-600">·</span>
                          <span className="text-[11px] text-zinc-400">{seriesCount} séries</span>
                          {calcVolume(s) > 0 && (
                            <>
                              <span className="text-[11px] text-zinc-600">·</span>
                              <span className="text-[11px] font-mono text-zinc-400">{vol}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pastilles de groupes */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {groups.slice(0, 4).map(g => (
                          <span
                            key={g}
                            className="w-2 h-2 rounded-full"
                            style={{ background: TAG_CLR[g], boxShadow: `0 0 6px ${TAG_CLR[g]}88` }}
                          />
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            session={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { startEdit(selected.id); setSelected(null) }}
            onDelete={handleDelete}
            onRepeat={handleRepeat}
          />
        )}
      </AnimatePresence>
    </>
  )
}
