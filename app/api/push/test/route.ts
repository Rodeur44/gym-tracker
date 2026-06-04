import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestUser } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Envoie immédiatement une notification de test à l'utilisateur connecté.
// Sert à diagnostiquer la chaîne push (abonnement + delivery) et à laisser
// l'utilisateur vérifier que ses notifications fonctionnent.
export async function POST() {
  const user = await getRequestUser()
  if (!user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ ok: false, found: 0, sent: 0, reason: error.message })
  if (!subs?.length) return NextResponse.json({ ok: false, found: 0, sent: 0, reason: 'no-subscription' })

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_SUBJECT || 'admin@gymlog.app'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
  const payload = JSON.stringify({
    title: 'Test GymLog ✅',
    body: 'Si tu vois ça, les notifications fonctionnent !',
    url: '/',
    tag: 'gymlog-test',
    vibrate: [300, 120, 300],
  })

  let sent = 0
  const errors: string[] = []
  await Promise.allSettled(subs.map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
      sent++
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode
      errors.push(String(status ?? (e as Error).message))
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      }
    }
  }))

  return NextResponse.json({ ok: sent > 0, found: subs.length, sent, errors })
}
