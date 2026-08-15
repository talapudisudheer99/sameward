/**
 * Public support contact — change NEXT_PUBLIC_SUPPORT_EMAIL anytime (redeploy / restart).
 */

const FALLBACK_SUPPORT_EMAIL = "sudheertalaudi@gmail.com"

export function getSupportEmail(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  return fromEnv || FALLBACK_SUPPORT_EMAIL
}

/** mailto with a helpful default subject for Sameward help requests */
export function getSupportMailtoHref(subject = "Sameward help"): string {
  const email = getSupportEmail()
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}
