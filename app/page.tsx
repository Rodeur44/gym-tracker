'use client'

import { useApp } from '@/context/AppContext'
import AuthScreen from '@/components/layout/AuthScreen'
import AppShell from '@/components/layout/AppShell'
import { LumaSpin } from '@/components/ui/luma-spin'

export default function Page() {
  const { user, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LumaSpin />
      </div>
    )
  }

  return user ? <AppShell /> : <AuthScreen />
}
