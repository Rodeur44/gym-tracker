'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Crown, Zap, BarChart2, Cloud, Sparkles, Calendar, Award, Headphones, KeyRound, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'

const BENEFITS = [
  { icon: Crown, text: 'Cartes premium exclusives — collection complète débloquée' },
  { icon: Zap, text: 'IA avancée — programmation long terme, deload automatique' },
  { icon: BarChart2, text: 'Analyses sur historique illimité (sinon limité à 30 jours)' },
  { icon: Sparkles, text: 'Programmes pro — PHAT, 5/3/1, Sheiko, GVT, Norwegian' },
  { icon: Cloud, text: 'Sync iCloud + export CSV / PDF de toutes tes données' },
  { icon: Calendar, text: 'Planning hebdo personnalisé avec rappels' },
  { icon: Award, text: 'Badges & trophées exclusifs Pro' },
  { icon: Headphones, text: 'Support prioritaire en moins de 24h' },
]

function getCardType(num: string) {
  const n = num.replace(/\s/g, '')
  if (n.startsWith('4')) return 'visa'
  if (n.startsWith('5') || n.startsWith('2')) return 'mastercard'
  if (n.startsWith('3')) return 'amex'
  return 'default'
}

function formatCardNumber(value: string) {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  const match = v.match(/\d{4,16}/g)?.[0] ?? ''
  const parts: string[] = []
  for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4))
  return parts.length ? parts.join(' ') : v
}

function formatExpiry(value: string) {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/g, '')
  if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4)
  return v
}

export default function ProScreen({ onClose }: { onClose: () => void }) {
  const { isPro, unlockPro, activatePro, disablePro } = useApp()
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [codeMode, setCodeMode] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [focused, setFocused] = useState<keyof typeof card | null>(null)

  function update(field: keyof typeof card, value: string) {
    let v = value
    if (field === 'number') { v = formatCardNumber(value); if (v.length > 19) return }
    else if (field === 'expiry') { v = formatExpiry(value); if (v.length > 5) return }
    else if (field === 'cvv') { v = value.replace(/[^0-9]/g, ''); if (v.length > 4) return }
    else if (field === 'name') { v = value.toUpperCase() }
    setCard(c => ({ ...c, [field]: v }))
  }

  const cardType = getCardType(card.number)
  const valid = card.number.replace(/\s/g, '').length >= 12 && card.name.length > 2 && card.expiry.length === 5 && card.cvv.length >= 3
  const showSuccess = success || (isPro && !codeMode)

  function pay() {
    if (!valid || paying) return
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      activatePro()
      setSuccess(true)
    }, 1400)
  }

  function submitCode() {
    const ok = unlockPro(code)
    if (!ok) { setCodeError(true); return }
    setCodeError(false)
    setSuccess(true)
  }

  return (
    <motion.div
      data-no-swipe
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col max-w-[430px] mx-auto"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Header */}
      <div className="relative px-5 pt-4 pb-5 overflow-hidden border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg,#3B0764 0%,#5B21B6 35%,#7C3AED 70%,#A78BFA 100%)' }}>
        <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-16 w-40 h-40 rounded-full bg-black/30 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Crown size={18} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-[1.6px]">
                {isPro ? 'Membre actif' : 'Abonnement'}
              </div>
              <h1 className="text-[20px] font-extrabold text-white leading-none tracking-tight mt-0.5">GymLog Pro</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/15 active:scale-95 transition-transform"
          >
            <X size={20} strokeWidth={1.8} className="text-white" />
          </button>
        </div>

        {!showSuccess && !codeMode && (
          <>
            <div className="relative mt-3 flex items-baseline gap-2">
              <span className="text-[28px] font-extrabold text-white leading-none tracking-[-1px]">4,99€</span>
              <span className="text-xs text-white/70">/ mois</span>
              <span className="ml-auto text-[10px] font-bold text-white bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
                7 jours offerts
              </span>
            </div>

            {/* Editable card — always visible (in non-scrolling header) */}
            <div className="relative mt-4">
              <EditableCard
                card={card}
                update={update}
                cardType={cardType}
                focused={focused}
                setFocused={setFocused}
              />
            </div>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {showSuccess ? (
          <SuccessView onClose={onClose} onDeactivate={() => { disablePro(); setSuccess(false) }} />
        ) : codeMode ? (
          <CodeView
            code={code}
            setCode={(v) => { setCode(v); setCodeError(false) }}
            error={codeError}
            onSubmit={submitCode}
            onBack={() => { setCodeMode(false); setCode(''); setCodeError(false) }}
          />
        ) : (
          <div className="px-5 pt-5 flex flex-col gap-5">
            {/* Submit button — first thing under header */}
            <motion.button
              whileTap={valid && !paying ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={pay}
              disabled={!valid || paying}
              className="w-full rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                height: 52,
                background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
                boxShadow: valid && !paying ? '0 12px 32px -10px rgba(109,40,217,0.6),inset 0 1px 0 rgba(255,255,255,0.18)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {paying ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  Paiement…
                </>
              ) : (
                <>
                  <Crown size={16} strokeWidth={2} />
                  Démarrer l'essai gratuit
                </>
              )}
            </motion.button>

            <button
              onClick={() => setCodeMode(true)}
              className="flex items-center justify-center gap-2 text-[13px] text-zinc-400 hover:text-[#A78BFA] transition-colors py-1"
            >
              <KeyRound size={14} strokeWidth={1.8} />
              J'ai un code d'invitation
            </button>

            {/* Benefits */}
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
                <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
                Tout ce qui est inclus
              </p>
              <div className="card-glass rounded-2xl p-4 flex flex-col gap-3">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border"
                      style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.22)' }}>
                      <Icon size={14} strokeWidth={1.8} className="text-[#A78BFA]" />
                    </div>
                    <span className="text-[13px] text-zinc-200 leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-600 leading-relaxed px-4">
              Aucun paiement réel n'est traité — démo uniquement.
              Annule à tout moment depuis tes réglages.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Editable card — the card itself IS the form ─────────────────────
function EditableCard({ card, update, cardType, focused, setFocused }: {
  card: { number: string; name: string; expiry: string; cvv: string }
  update: (field: 'number' | 'name' | 'expiry' | 'cvv', value: string) => void
  cardType: string
  focused: 'number' | 'name' | 'expiry' | 'cvv' | null
  setFocused: (f: 'number' | 'name' | 'expiry' | 'cvv' | null) => void
}) {
  const inputBase = 'bg-transparent outline-none text-white placeholder:text-white/35 transition-shadow rounded-md'

  return (
    <div
      className="rounded-2xl p-4 flex flex-col justify-between overflow-hidden border relative"
      style={{
        height: 178,
        background: 'linear-gradient(135deg,#1E0B3D 0%,#3B0764 35%,#5B21B6 70%,#7C3AED 100%)',
        borderColor: 'rgba(255,255,255,0.18)',
        boxShadow: '0 16px 40px -12px rgba(15,5,40,0.7), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/30 blur-2xl pointer-events-none" />

      {/* Top row */}
      <div className="relative flex justify-between items-start">
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
          <div className="w-5 h-3.5 bg-yellow-200/80 rounded-sm" />
        </div>
        <CardLogo cardType={cardType} />
      </div>

      {/* Number */}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          name="gymlog-number"
          aria-label="Numéro de carte"
          value={card.number}
          onChange={e => update('number', e.target.value)}
          onFocus={() => setFocused('number')}
          onBlur={() => setFocused(null)}
          placeholder="•••• •••• •••• ••••"
          maxLength={19}
          className={`${inputBase} w-full font-mono text-[18px] tracking-[0.16em] py-1 px-1 -mx-1 ${focused === 'number' ? 'bg-white/[0.08]' : ''}`}
        />
      </div>

      {/* Bottom row */}
      <div className="relative flex justify-between items-end gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-bold text-white/55 uppercase tracking-[1.4px]">Titulaire</div>
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="gymlog-name"
            aria-label="Nom du titulaire"
            value={card.name}
            onChange={e => update('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="NOM PRÉNOM"
            className={`${inputBase} w-full text-[13px] font-medium uppercase mt-0.5 py-1 px-1 -mx-1 ${focused === 'name' ? 'bg-white/[0.08]' : ''}`}
          />
        </div>
        <div className="flex-shrink-0 w-[58px]">
          <div className="text-[9px] font-bold text-white/55 uppercase tracking-[1.4px]">Expire</div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="gymlog-exp"
            aria-label="Date d'expiration"
            value={card.expiry}
            onChange={e => update('expiry', e.target.value)}
            onFocus={() => setFocused('expiry')}
            onBlur={() => setFocused(null)}
            placeholder="MM/AA"
            maxLength={5}
            className={`${inputBase} w-full text-[13px] font-mono mt-0.5 py-1 px-1 -mx-1 ${focused === 'expiry' ? 'bg-white/[0.08]' : ''}`}
          />
        </div>
        <div className="flex-shrink-0 w-[44px]">
          <div className="text-[9px] font-bold text-white/55 uppercase tracking-[1.4px]">CVV</div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            name="gymlog-cvv"
            aria-label="Code CVV"
            value={card.cvv}
            onChange={e => update('cvv', e.target.value)}
            onFocus={() => setFocused('cvv')}
            onBlur={() => setFocused(null)}
            placeholder="•••"
            maxLength={4}
            className={`${inputBase} w-full text-[13px] font-mono mt-0.5 py-1 px-1 -mx-1 ${focused === 'cvv' ? 'bg-white/[0.08]' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}

function CardLogo({ cardType }: { cardType: string }) {
  if (cardType === 'visa') return <span className="font-extrabold italic text-white tracking-wide text-base">VISA</span>
  if (cardType === 'mastercard') return (
    <div className="flex items-center">
      <div className="w-5 h-5 rounded-full bg-red-500/90" />
      <div className="w-5 h-5 rounded-full bg-yellow-500/90 -ml-2 mix-blend-screen" />
    </div>
  )
  if (cardType === 'amex') return <span className="font-extrabold text-white tracking-wider text-sm">AMEX</span>
  return <span className="text-[10px] font-bold text-white/55 uppercase tracking-[1.4px]">GymLog</span>
}

function CodeView({ code, setCode, error, onSubmit, onBack }: {
  code: string
  setCode: (v: string) => void
  error: boolean
  onSubmit: () => void
  onBack: () => void
}) {
  return (
    <div className="px-5 pt-8 flex flex-col gap-5">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4 border"
          style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.05))', borderColor: 'rgba(139,92,246,0.22)', boxShadow: '0 0 30px -10px rgba(139,92,246,0.4)' }}>
          <KeyRound size={26} strokeWidth={1.8} className="text-[#A78BFA]" />
        </div>
        <h2 className="text-lg font-bold text-zinc-100 mb-1.5">Code d'invitation</h2>
        <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[280px]">
          Entre ton code pour débloquer toutes les fonctionnalités Pro gratuitement.
        </p>
      </div>

      <div className="card-glass rounded-2xl p-4 flex flex-col gap-3">
        <input
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="EX: GYMBROS"
          className={`w-full h-12 px-4 rounded-xl bg-[#1C1C1C] border text-center text-zinc-100 font-mono text-base tracking-[2px] placeholder:text-zinc-600 placeholder:tracking-normal focus:outline-none transition-all ${error ? 'border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]' : 'border-white/[0.08] focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]'}`}
        />
        {error && (
          <div className="flex items-center gap-2 text-[12px] text-red-400 px-1">
            <AlertCircle size={12} strokeWidth={1.8} />
            Code invalide. Vérifie l'orthographe.
          </div>
        )}
      </div>

      <motion.button
        whileTap={code.length >= 3 ? { scale: 0.97 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={onSubmit}
        disabled={code.length < 3}
        className="w-full rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          height: 52,
          background: 'linear-gradient(135deg,#6D28D9,#7C3AED 50%,#8B5CF6)',
          boxShadow: code.length >= 3 ? '0 12px 32px -10px rgba(109,40,217,0.6),inset 0 1px 0 rgba(255,255,255,0.18)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <Check size={16} strokeWidth={2} />
        Valider le code
      </motion.button>

      <button
        onClick={onBack}
        className="text-[13px] text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
      >
        Retour à l'abonnement
      </button>
    </div>
  )
}

function SuccessView({ onClose, onDeactivate }: { onClose: () => void; onDeactivate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
    >
      <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-5 border"
        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.18),rgba(99,102,241,0.08))', borderColor: 'rgba(139,92,246,0.35)', boxShadow: '0 0 36px -6px rgba(139,92,246,0.55)' }}>
        <Check size={36} strokeWidth={2.4} className="text-[#A78BFA]" />
      </div>
      <h3 className="text-lg font-bold text-zinc-100 mb-2">Bienvenue dans Pro 🎉</h3>
      <p className="text-sm text-zinc-400 leading-relaxed max-w-[280px]">
        Toutes les fonctionnalités sont débloquées. Tu peux fermer cette fenêtre et revenir quand tu veux.
      </p>
      <button
        onClick={onClose}
        className="mt-6 h-11 px-7 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.45)' }}
      >
        Continuer
      </button>
      <button
        onClick={onDeactivate}
        className="mt-4 text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        Désactiver Pro (debug)
      </button>
    </motion.div>
  )
}
