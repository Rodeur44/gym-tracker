import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRequestUser } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const ADMIN_EMAIL = 'enbordigoni@gmail.com'

export async function GET() {
  const user = await getRequestUser()
  if (user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (error) throw error

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      display_name: u.user_metadata?.display_name ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }))

    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ total: users.length, users }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur serveur.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
