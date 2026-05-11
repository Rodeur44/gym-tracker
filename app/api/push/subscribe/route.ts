import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await sb.auth.getUser(token)
  return data.user?.id ?? null
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { endpoint: string; p256dh: string; auth: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const admin = createAdminClient()
  const { error } = await admin.from('push_subscriptions').upsert(
    { user_id: userId, endpoint: body.endpoint, p256dh: body.p256dh, auth: body.auth },
    { onConflict: 'user_id,endpoint' }
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { endpoint: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const admin = createAdminClient()
  await admin.from('push_subscriptions').delete().match({ user_id: userId, endpoint: body.endpoint })
  return NextResponse.json({ ok: true })
}
