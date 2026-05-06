'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Users, RefreshCw, AlertCircle } from 'lucide-react'

interface AppUser {
  id: string
  email: string
  display_name: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface Props {
  onClose: () => void
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const sheetVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRelative(iso: string | null) {
  if (!iso) return 'jamais'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days}j`
  if (days < 30) return `il y a ${Math.floor(days / 7)}sem`
  return `il y a ${Math.floor(days / 30)}mois`
}

export default function AdminScreen({ onClose }: Props) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      setTotal(data.total)
      setUsers(data.users)
    } catch {
      setError('Impossible de charger les utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden" animate="visible" exit="exit"
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        variants={sheetVariants}
        initial="hidden" animate="visible" exit="exit"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] bg-[#141414] border border-white/[0.08] rounded-t-3xl flex flex-col"
        style={{ maxHeight: '88dvh' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 flex-shrink-0" />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.6px]">Admin</p>
            <h2 className="text-[17px] font-semibold text-white tracking-tight flex items-center gap-2">
              <Users size={16} strokeWidth={1.8} className="text-[#A78BFA]" />
              Utilisateurs
              {!loading && (
                <span className="text-[13px] font-mono text-[#A78BFA] bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.25)] px-2 py-0.5 rounded-full">
                  {total}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              aria-label="Rafraîchir"
              className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            >
              <RefreshCw size={14} strokeWidth={1.8} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-8">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl mb-3">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[62px] rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {users.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-none"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#A78BFA)' }}
                  >
                    {(u.display_name || u.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {u.display_name ? (
                        <><span className="text-white">{u.display_name}</span> <span className="text-zinc-500 text-[11px]">{u.email}</span></>
                      ) : u.email}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Inscrit {fmtDate(u.created_at)} · Vu {fmtRelative(u.last_sign_in_at)}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 flex-shrink-0">
                    #{String(total - i).padStart(3, '0')}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
