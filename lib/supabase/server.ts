import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

// Server-side Supabase client bound to the request cookies.
// Use this in Route Handlers / Server Components to read the logged-in user.
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Route Handlers can't always set cookies; ignore write failures.
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            /* called from a context where cookies are read-only */
          }
        },
      },
    },
  )
}

// Returns the authenticated user for the current request, or null.
export async function getRequestUser(): Promise<User | null> {
  try {
    const sb = await createServerSupabase()
    const { data: { user } } = await sb.auth.getUser()
    return user ?? null
  } catch {
    return null
  }
}
