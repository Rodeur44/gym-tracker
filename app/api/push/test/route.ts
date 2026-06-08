import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestUser } from '@/lib/supabase/server'
import { vapidSubject } from '@/lib/vapid'

export const runtime = 'nodejs'

// Envoie une notification de test immédiate + renvoie un diagnostic détaillé
// (quelle clé publique le serveur utilise, si la clé privée est posée, et le
// message d'erreur brut du service de push) pour diagnostiquer les 403.
export async function POST() {
  const user = await getRequestUser()
  if (!user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const priv = process.env.VAPID_PRIVATE_KEY || ''
  const diag = {
    publicKeyHead: pub ? pub.slice(0, 12) : '(vide)',
    publicKeyLen: pub.length,
    privateKeySet: !!priv,
    privateKeyLen: priv.length,
  }

  const admin = createAdminClient()
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ ok: false, found: 0, sent: 0, reason: error.message, diag })
  if (!subs?.length) return NextResponse.json({ ok: false, found: 0, sent: 0, reason: 'no-subscription', diag })

  if (!pub || !priv) {
    return NextResponse.json({ ok: false, found: subs.length, sent: 0, reason: 'vapid-keys-missing', diag })
  }

  webpush.setVapidDetails(vapidSubject(), pub, priv)
  const payload = JSON.stringify({
    title: 'Test GymLog ✅',
    body: 'Si tu vois ça, les notifications fonctionnent !',
    url: '/', tag: 'gymlog-test', vibrate: [300, 120, 300],
  })

  let sent = 0
  const errors: string[] = []
  await Promise.allSettled(subs.map(async s => {
    // L'endpoint d'abonnement révèle le service de push utilisé (Apple/FCM/…).
    const service = (() => { try { return new URL(s.endpoint).host } catch { return '?' } })()
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
      sent++
    } catch (e: unknown) {
      const err = e as { statusCode?: number; body?: string; message?: string }
      const body = (err.body || err.message || '').toString().replace(/\s+/g, ' ').slice(0, 160)
      errors.push(`[${service}] ${err.statusCode ?? '?'}: ${body}`)
      if (err.statusCode === 404 || err.statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      }
    }
  }))

  return NextResponse.json({ ok: sent > 0, found: subs.length, sent, errors, diag })
}
