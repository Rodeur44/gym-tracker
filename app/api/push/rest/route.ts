import { NextRequest, NextResponse, after } from 'next/server'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestUser } from '@/lib/supabase/server'
import { vapidSubject, vapidPublicKey } from '@/lib/vapid'

export const runtime = 'nodejs'
// Le travail en arrière-plan (after) peut tourner jusqu'à cette limite.
export const maxDuration = 300

// Repos max réellement notifiable (marge sous maxDuration).
const MAX_NOTIFY_SEC = 290

function setupVapid() {
  webpush.setVapidDetails(
    vapidSubject(),
    vapidPublicKey(),
    process.env.VAPID_PRIVATE_KEY!,
  )
}

// Programme une notification « repos terminé » qui se déclenchera à la fin du
// repos, même si l'app est fermée (le travail vit dans after(), découplé de la
// requête client). Annulable via DELETE (table rest_timers).
export async function POST(req: NextRequest) {
  const user = await getRequestUser()
  if (!user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })

  let body: { seconds?: number; token?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }) }

  const seconds = Number(body.seconds)
  const token = typeof body.token === 'string' ? body.token : ''
  if (!token || !Number.isFinite(seconds) || seconds < 5 || seconds > MAX_NOTIFY_SEC) {
    // Repos trop long pour être notifié en arrière-plan : on ignore proprement.
    return NextResponse.json({ ok: true, scheduled: false })
  }

  const admin = createAdminClient()
  const fireAt = new Date(Date.now() + seconds * 1000).toISOString()

  // Une seule ligne par user (PK user_id) → remplace tout repos précédent.
  const { error } = await admin
    .from('rest_timers')
    .upsert({ user_id: user.id, token, fire_at: fireAt }, { onConflict: 'user_id' })
  if (error) {
    // Table absente / RLS : on ne bloque pas le repos, juste pas de notif.
    return NextResponse.json({ ok: true, scheduled: false })
  }

  after(async () => {
    await new Promise(r => setTimeout(r, seconds * 1000))

    // Toujours d'actualité ? (pas passé/annulé/remplacé)
    const { data: row } = await admin
      .from('rest_timers')
      .select('token')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!row || row.token !== token) return // annulé ou remplacé

    await admin.from('rest_timers').delete().eq('user_id', user.id).eq('token', token)

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user.id)
    if (!subs?.length) return

    setupVapid()
    const payload = JSON.stringify({
      title: 'Repos terminé 💪',
      body: "C'est reparti — prochaine série !",
      url: '/',
      tag: 'gymlog-rest',
      vibrate: [300, 120, 300],
    })
    await Promise.allSettled(subs.map(async s => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await admin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    }))
  })

  return NextResponse.json({ ok: true, scheduled: true })
}

// Annule la notification de repos en cours (repos passé / arrêté).
export async function DELETE() {
  const user = await getRequestUser()
  if (!user) return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  try {
    const admin = createAdminClient()
    await admin.from('rest_timers').delete().eq('user_id', user.id)
  } catch { /* table absente : rien à annuler */ }
  return NextResponse.json({ ok: true })
}
