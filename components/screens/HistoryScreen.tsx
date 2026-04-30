'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, Pencil } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { TYPE_LBL, TAG_CLR, TAG_BG } from '@/lib/constants'
import type { MuscleGroup, Session } from '@/types'

function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function DetailModal({ session, onClose, onEdit, onDelete }: {
  session: Session
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const clr = TAG_CLR[session.type as MuscleGroup]
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
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full border"
            style={{ color: clr, background: TAG_BG[session.type as MuscleGroup], borderColor: `${clr}33` }}>
            {TYPE_LBL[session.type as MuscleGroup]}
          </span>
          <span className="text-xs text-zinc-500 font-mono">{fmtDate(session.date)}</span>
        </div>

        <div className="flex flex-col gap-1 mb-6">
          {(session.exos || []).map((e, i) => (
            <div key={i} className="py-3 border-b border-white/[0.05] last:border-none">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-zinc-200">{e.name}</span>
                <span className="text-xs font-mono text-zinc-500">{e.sets.length} série{e.sets.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {e.sets.map((s, si) => (
                  <span key={si} className="text-[11px] font-mono bg-[#1C1C1C] border border-white/[0.06] px-2.5 py-1 rounded-lg text-zinc-400">
                    {s.weight > 0 ? `${s.weight}kg` : 'corps'} × {s.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-[#1C1C1C] border border-white/[0.06] text-sm font-semibold text-zinc-300 hover:bg-[#222] transition-all">
            Fermer
          </button>
          <button onClick={onEdit} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5)' }}>
            <Pencil size={14} /> Modifier
          </button>
        </div>
        <button onClick={onDelete} className="w-full py-3 rounded-2xl text-sm font-semibold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
          Supprimer la séance
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function HistoryScreen() {
  const { sessions, deleteSession, startEdit } = useApp()
  const [selected, setSelected] = useState<Session | null>(null)

  async function handleDelete() {
    if (!selected) return
    await deleteSession(selected.id)
    setSelected(null)
  }

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="w-18 h-18 rounded-[22px] flex items-center justify-center mb-5 border"
          style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.05))', borderColor: 'rgba(139,92,246,0.18)', boxShadow: '0 0 30px -10px rgba(139,92,246,0.35)', width: 72, height: 72 }}>
          <Clock size={32} className="text-[#A78BFA]" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-2">Aucune séance</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">Enregistre ta première séance<br />pour la voir apparaître ici.</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-5 pb-28"
      >
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-4 flex items-center gap-2">
          <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
          {sessions.length} séance{sessions.length > 1 ? 's' : ''}
        </p>
        <div className="card-glass rounded-2xl overflow-hidden">
          {sessions.map((s, i) => {
            const clr = TAG_CLR[s.type as MuscleGroup]
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelected(s)}
                className="flex items-center gap-4 px-4 py-4 border-b border-white/[0.04] last:border-none cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-all"
              >
                <div className="w-0.5 h-9 rounded-full flex-shrink-0" style={{ background: clr, boxShadow: `0 0 12px ${clr}55` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 tracking-tight">{TYPE_LBL[s.type as MuscleGroup]}</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{fmtDate(s.date)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-zinc-500 mb-1">{(s.exos || []).length} exercices</div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                    style={{ color: clr, background: TAG_BG[s.type as MuscleGroup], borderColor: `${clr}33` }}>
                    {TYPE_LBL[s.type as MuscleGroup].split(' ')[0]}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            session={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { startEdit(selected.id); setSelected(null) }}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  )
}
