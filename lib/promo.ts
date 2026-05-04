// Codes valides pour débloquer GymLog Pro gratuitement (testing / amis).
// Édite cette liste selon les codes que tu veux donner.
export const PROMO_CODES = [
  'GYMBROS',
  'BETA2026',
  'AMIS',
  'TESTING',
  'ENZO',
] as const

export function validatePromo(code: string): boolean {
  const normalized = code.trim().toUpperCase()
  return PROMO_CODES.some(c => c === normalized)
}
