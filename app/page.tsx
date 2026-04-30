'use client'

import { useApp } from '@/context/AppContext'
import AuthScreen from '@/components/layout/AuthScreen'
import AppShell from '@/components/layout/AppShell'

export default function Page() {
  const { user, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#A78BFA]/20 border-t-[#A78BFA] animate-spin" />
      </div>
    )
  }

  return user ? <AppShell /> : <AuthScreen />
}
