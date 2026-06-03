'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

// État vide premium standardisé (cf. UI/UX §8). Icône dans une tuile violette
// avec glow, titre, message court, et une action optionnelle.
export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon
  title: string
  message: string
  action?: EmptyStateAction
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
    >
      <div
        className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border"
        style={{
          background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(139,92,246,0.06))',
          borderColor: 'rgba(139,92,246,0.2)',
          boxShadow: '0 0 40px -12px rgba(139,92,246,0.4)',
        }}
      >
        <Icon size={36} strokeWidth={1.8} className="text-[#A78BFA]" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed max-w-[260px]">{message}</p>
      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={action.onClick}
          className="mt-6 h-12 px-6 rounded-2xl text-[14px] font-semibold text-white flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
            boxShadow: '0 8px 24px -8px rgba(109,40,217,0.5),inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          {action.icon && <action.icon size={16} strokeWidth={2} />}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
