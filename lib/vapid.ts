import crypto from 'crypto'

// Sujet VAPID toujours valide (Apple rejette un sub mal formé → BadJwtToken).
// On ignore volontairement VAPID_SUBJECT : un mailto par défaut suffit et évite
// toute valeur invalide en env.
export function vapidSubject(): string {
  return 'mailto:admin@gymlog.app'
}

const toB64Url = (buf: Buffer) =>
  buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromB64Url = (s: string) =>
  Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

/**
 * Clé publique VAPID DÉRIVÉE de la clé privée → garantit une paire valide,
 * quoi qu'il y ait dans NEXT_PUBLIC_VAPID_PUBLIC_KEY. Repli sur l'env si la
 * dérivation échoue.
 */
export function vapidPublicKey(): string {
  const priv = process.env.VAPID_PRIVATE_KEY || ''
  if (priv) {
    try {
      const ecdh = crypto.createECDH('prime256v1')
      ecdh.setPrivateKey(fromB64Url(priv))
      return toB64Url(ecdh.getPublicKey()) // point non compressé (65 octets)
    } catch { /* repli ci-dessous */ }
  }
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
}
