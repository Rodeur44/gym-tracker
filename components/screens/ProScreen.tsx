'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Crown, Zap, BarChart2, Cloud, Sparkles } from 'lucide-react'

const BENEFITS = [
  { icon: Crown, text: 'Collection de cartes complète débloquée' },
  { icon: Zap, text: 'Suggestions IA personnalisées avancées' },
  { icon: BarChart2, text: 'Graphiques de progression illimités' },
  { icon: Cloud, text: 'Sauvegarde cloud automatique' },
  { icon: Sparkles, text: 'Programmes & analyses détaillées' },
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
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [flipped, setFlipped] = useState(false)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)

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

  function pay() {
    if (!valid || paying) return
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      setSuccess(true)
    }, 1400)
  }

  return (
    <motion.div
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
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-[1.6px]">Abonnement</div>
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

        <div className="relative mt-5 flex items-baseline gap-2">
          <span className="text-[42px] font-extrabold text-white leading-none tracking-[-1.5px]">4,99€</span>
          <span className="text-sm text-white/70">/ mois</span>
          <span className="ml-auto text-[10px] font-bold text-white bg-white/15 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
            7 jours offerts
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {success ? (
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
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Bienvenue dans Pro</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-[260px]">
              Toutes les fonctionnalités sont maintenant débloquées. Tu peux fermer cette fenêtre.
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-11 px-6 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)', boxShadow: '0 8px 24px -8px rgba(109,40,217,0.45)' }}
            >
              Continuer
            </button>
          </motion.div>
        ) : (
          <div className="px-5 pt-6 flex flex-col gap-6">
            {/* Benefits */}
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
                <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
                Inclus
              </p>
              <div className="card-glass rounded-2xl p-4 flex flex-col gap-3">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.22)' }}>
                      <Icon size={16} strokeWidth={1.8} className="text-[#A78BFA]" />
                    </div>
                    <span className="text-sm text-zinc-200 leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card preview */}
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[1.8px] mb-3 flex items-center gap-2">
                <span className="w-[3px] h-[11px] rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(139,92,246,0.5)] inline-block" />
                Moyen de paiement
              </p>
              <div className="relative h-[210px] w-full" style={{ perspective: 1200 }}>
                <div
                  className="relative w-full h-full transition-transform duration-700"
                  style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden border"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg,#1E0B3D 0%,#3B0764 35%,#5B21B6 70%,#7C3AED 100%)',
                      borderColor: 'rgba(139,92,246,0.3)',
                      boxShadow: '0 20px 50px -12px rgba(91,33,182,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-black/30 blur-2xl pointer-events-none" />

                    <div className="relative flex justify-between items-start">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
                        <div className="w-5 h-3.5 bg-yellow-200/80 rounded-sm" />
                      </div>
                      <div className="text-right h-7 flex items-center">
                        {cardType === 'visa' && <span className="text-lg font-extrabold italic text-white tracking-wide">VISA</span>}
                        {cardType === 'mastercard' && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-red-500/90" />
                            <div className="w-5 h-5 rounded-full bg-yellow-500/90 -ml-2 mix-blend-screen" />
                          </div>
                        )}
                        {cardType === 'amex' && <span className="text-base font-extrabold text-white tracking-wider">AMEX</span>}
                        {cardType === 'default' && <span className="text-[10px] font-bold text-white/50 uppercase tracking-[1.4px]">GymLog</span>}
                      </div>
                    </div>

                    <div className="relative font-mono text-[19px] tracking-[0.18em] text-white">
                      {card.number || '•••• •••• •••• ••••'}
                    </div>

                    <div className="relative flex justify-between items-end">
                      <div className="min-w-0 mr-3">
                        <div className="text-[9px] font-bold text-white/50 uppercase tracking-[1.4px]">Titulaire</div>
                        <div className="text-[13px] font-medium text-white truncate mt-0.5">{card.name || 'NOM PRÉNOM'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-white/50 uppercase tracking-[1.4px]">Expire</div>
                        <div className="text-[13px] font-mono text-white mt-0.5">{card.expiry || 'MM/AA'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden border"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg,#1E0B3D 0%,#3B0764 50%,#5B21B6 100%)',
                      borderColor: 'rgba(139,92,246,0.3)',
                      boxShadow: '0 20px 50px -12px rgba(91,33,182,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <div className="w-full h-10 bg-black/80 mt-6" />
                    <div className="px-5 pt-6">
                      <div className="bg-white/95 h-9 rounded flex items-center justify-end px-3">
                        <span className="text-zinc-900 font-mono text-base">{card.cvv || '•••'}</span>
                      </div>
                      <div className="text-[10px] font-bold text-white/60 uppercase tracking-[1.4px] mt-2">CVV</div>
                    </div>
                    <div className="absolute bottom-4 right-5 text-[10px] font-bold text-white/50 uppercase tracking-[1.4px]">
                      GymLog Pro
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="card-glass rounded-2xl p-4 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">Numéro de carte</label>
                <input
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={e => update('number', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 font-mono text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">Titulaire</label>
                <input
                  placeholder="Jean Dupont"
                  value={card.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 text-sm placeholder:text-zinc-600 uppercase focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">Expiration</label>
                  <input
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={e => update('expiry', e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1.4px] mb-1.5 block">CVV</label>
                  <input
                    inputMode="numeric"
                    placeholder="123"
                    value={card.cvv}
                    onChange={e => update('cvv', e.target.value)}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    className="w-full h-11 px-3 rounded-xl bg-[#1C1C1C] border border-white/[0.08] text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#A78BFA] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)] transition-all"
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={valid && !paying ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={pay}
              disabled={!valid || paying}
              className="w-full h-13 rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-center text-[11px] text-zinc-600 leading-relaxed px-4">
              Essai gratuit de 7 jours. Annule à tout moment depuis tes réglages.
              Aucun paiement réel n'est traité — démo uniquement.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
