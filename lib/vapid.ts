// Sujet VAPID valide pour Apple/FCM. Apple rejette le JWT (BadJwtToken) si le
// `sub` n'est pas un mailto: ou https: bien formé. On normalise quelle que soit
// la forme de la variable d'env (avec ou sans préfixe mailto:).
export function vapidSubject(): string {
  const raw = (process.env.VAPID_SUBJECT || '').trim()
  if (!raw) return 'mailto:admin@gymlog.app'
  if (raw.startsWith('mailto:') || raw.startsWith('https://')) return raw
  if (raw.includes('@')) return `mailto:${raw}`
  return 'mailto:admin@gymlog.app'
}
