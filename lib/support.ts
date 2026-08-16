/**
 * Public support contact. NEXT_PUBLIC_SUPPORT_EMAIL overrides it, but that value
 * is inlined at build time — the web service needs a redeploy, not a restart.
 *
 * The fallback is the live address: the apex is an ALIAS (not a CNAME), so it can
 * carry MX records, and ImprovMX forwards support@ to a real inbox.
 */

const FALLBACK_SUPPORT_EMAIL = "support@sameward.com"

export function getSupportEmail(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  return fromEnv || FALLBACK_SUPPORT_EMAIL
}

/** mailto with a helpful default subject for Sameward help requests */
export function getSupportMailtoHref(subject = "Sameward help"): string {
  const email = getSupportEmail()
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}
