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

export async function subscribePush(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) return null
  try {
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
