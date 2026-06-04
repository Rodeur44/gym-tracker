function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buf = new ArrayBuffer(raw.length)
  const arr = new Uint8Array(buf)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return buf
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch {
    return null
  }
}

export function getNotifPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

async function getVapidPublicKey(): Promise<string | null> {
  // Récupère la clé depuis le serveur (toujours alignée avec la clé privée),
  // avec repli sur la valeur gravée au build si le réseau échoue.
  try {
    const res = await fetch('/api/push/vapid-public-key', { cache: 'no-store' })
    const data = await res.json()
    if (data?.key) return data.key as string
  } catch { /* repli ci-dessous */ }
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null
}

export async function subscribePush(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const vapidKey = await getVapidPublicKey()
  if (!vapidKey) return null
  try {
    // Supprime un éventuel abonnement existant (potentiellement créé avec une
    // ancienne clé) pour repartir proprement avec la clé serveur courante.
    const existing = await reg.pushManager.getSubscription()
    if (existing) await existing.unsubscribe()

    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
  } catch {
    return null
  }
}

export async function unsubscribePush(reg: ServiceWorkerRegistration): Promise<boolean> {
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return true
  return sub.unsubscribe()
}

export function serializeSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  return {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? '',
    auth: json.keys?.auth ?? '',
  }
}
