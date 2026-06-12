import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validatePromo } from '@/lib/promo'
import { rateLimitPersistent } from '@/lib/rate-limit'

export const runtime = 'nodejs'

// Grants GymLog Pro to the authenticated user, persisting the entitlement in
// `app_metadata` (which the user cannot edit, unlike localStorage or
// user_metadata). Two intents are accepted:
//   - { code }         → validates an invite code server-side
//   - { demoPayment }  → simulated checkout (no real payment is processed).
//                        Replace this branch with a Stripe webhook for real billing.
export async function POST(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  // Cap redeem attempts so invite codes can't be brute-forced.
  const rl = await rateLimitPersistent(`pro-redeem:${user.id}`, { limit: 10, windowSec: 60 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessaie dans une minute.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  let body: { code?: string; demoPayment?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const viaCode = typeof body.code === 'string' && body.code.length <= 64
  if (!body.demoPayment && !viaCode) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
  }
  if (viaCode && !validatePromo(body.code!)) {
    return NextResponse.json({ error: 'Code invalide.' }, { status: 422 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, pro: true },
    })
    if (error) throw error
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur serveur.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Revokes Pro for the authenticated user (debug / "annuler l'abonnement").
export async function DELETE() {
  const user = await getRequestUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }
  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, pro: false },
    })
    if (error) throw error
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur serveur.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
