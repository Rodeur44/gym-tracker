import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Renvoie la clé publique VAPID au runtime (et non gravée au build), pour que
// l'abonnement push utilise toujours la clé qui correspond à la clé privée du
// serveur — quel que soit le build mis en cache côté client.
export function GET() {
  return NextResponse.json(
    { key: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '' },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
