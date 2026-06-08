import { NextResponse } from 'next/server'
import { vapidPublicKey } from '@/lib/vapid'

export const runtime = 'nodejs'

// Renvoie la clé publique VAPID dérivée de la clé privée (paire garantie),
// pour que l'abonnement push corresponde toujours à la signature serveur.
export function GET() {
  return NextResponse.json(
    { key: vapidPublicKey() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
