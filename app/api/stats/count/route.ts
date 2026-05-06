import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1 })
    if (error) throw error
    // Supabase returns total count even with perPage:1
    const total = data.total ?? data.users.length
    return NextResponse.json({ total }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ total: 0 }, { status: 200 })
  }
}
