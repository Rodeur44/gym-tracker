'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function AuthScreen() {
  const sb = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAuth() {
    if (!email || !password || (mode === 'signup' && !name.trim())) { setMsg({ text: 'Remplis tous les champs.', type: 'error' }); return }
    setLoading(true); setMsg(null)
    if (mode === 'login') {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) setMsg({ text: 'Email ou mot de passe incorrect.', type: 'error' })
    } else {
      const { error } = await sb.auth.signUp({ email, password, options: { data: { display_name: name || email.split('@')[0] } } })
      if (error) setMsg({ text: error.message, type: 'error' })
      else setMsg({ text: 'Vérifie tes emails pour confirmer !', type: 'success' })
    }
    setLoading(false)
  }

  async function signInGoogle() {
    await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-7 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-5xl font-extrabold tracking-[-2px] mb-2">
          Gym<span className="text-[#A78BFA] drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]">Log</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-10 leading-relaxed">
          Suis tes séances, bats tes records,<br />débloque ta collection de cartes.
        </p>

        {/* Tabs */}
        <div className="flex bg-[#1C1C1C] border border-white/[0.06] rounded-2xl p-1 mb-6 gap-1">
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMsg(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${mode === m ? 'bg-[#141414] text-white shadow-sm' : 'text-zinc-500'}`}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] outline-none transition-all"
          />
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                key="pseudo-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 54 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <input
                  type="text"
                  placeholder="Pseudo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(139,92,246,0.12)] outline-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] shadow-[0_12px_32px_-8px_rgba(109,40,217,0.6)] hover:shadow-[0_20px_40px_-8px_rgba(109,40,217,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
          >
            {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </motion.button>
        </div>

        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm text-center px-4 py-3 rounded-xl mb-4 ${msg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#A78BFA]'}`}
          >
            {msg.text}
          </motion.div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[11px] text-zinc-600 uppercase tracking-widest font-medium">ou</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={signInGoogle}
          className="w-full bg-[#1C1C1C] border border-white/[0.06] rounded-2xl py-3.5 flex items-center justify-center gap-3 text-sm font-medium text-white hover:border-white/10 hover:bg-[#141414] transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuer avec Google
        </motion.button>
      </motion.div>
    </div>
  )
}
