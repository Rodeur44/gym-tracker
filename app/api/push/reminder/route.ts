import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { vapidSubject, vapidPublicKey } from '@/lib/vapid'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  webpush.setVapidDetails(
    vapidSubject(),
    vapidPublicKey(),
    process.env.VAPID_PRIVATE_KEY!,
  )
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('Authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Get today's date in ISO format
  const today = new Date().toISOString().slice(0, 10)

  // Get all subscriptions with their user_id
  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')

  if (error || !subs) {
    return NextResponse.json({ error: error?.message || 'No data' }, { status: 500 })
  }

  // Find users who already trained today
  const { data: trainedToday } = await admin
    .from('sessions')
    .select('user_id')
    .eq('date', today)

  const trainedSet = new Set((trainedToday ?? []).map(r => r.user_id))

  // Send to users who haven't trained today
  const targets = subs.filter(s => !trainedSet.has(s.user_id))
  let sent = 0
  let failed = 0

  await Promise.allSettled(
    targets.map(async sub => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: 'GymLog',
            body: "Tu n'as pas encore entraîné aujourd'hui. 💪 C'est l'heure !",
            url: '/',
          })
        )
        sent++
      } catch (e: unknown) {
        // Remove expired/invalid subscriptions
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        failed++
      }
    })
  )

  return NextResponse.json({ sent, failed, skipped: subs.length - targets.length })
}
