'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-dvh bg-[#0A0A0A] flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div
          className="w-18 h-18 rounded-[22px] flex items-center justify-center mb-5 border"
          style={{
            background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.05))',
            borderColor: 'rgba(139,92,246,0.18)',
            boxShadow: '0 0 30px -10px rgba(139,92,246,0.35)',
          }}
        >
          <AlertTriangle size={32} strokeWidth={1.8} className="text-[#A78BFA]" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-2">Oups, quelque chose a cassé</h3>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-[240px] mb-6">
          Tes données sont en sécurité. Réessaie — si ça persiste, recharge l&apos;app.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={reset}
          className="flex items-center gap-2 min-h-[44px] px-6 rounded-2xl text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
            boxShadow: '0 0 12px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <RotateCcw size={16} strokeWidth={2} />
          Réessayer
        </motion.button>
        {error.digest && (
          <p className="text-[11px] font-mono text-zinc-500 mt-6">Code : {error.digest}</p>
        )}
      </motion.div>
    </div>
  )
}
