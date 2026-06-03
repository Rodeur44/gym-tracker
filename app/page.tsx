'use client'

import { useApp } from '@/context/AppContext'
import AuthScreen from '@/components/layout/AuthScreen'
import AppShell from '@/components/layout/AppShell'
import AppSkeleton from '@/components/layout/AppSkeleton'

export default function Page() {
  const { user, loading } = useApp()

  if (loading) return <AppSkeleton />

  return user ? <AppShell /> : <AuthScreen />
}
