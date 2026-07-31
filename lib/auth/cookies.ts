/**
 * Single place that defines what our session cookie looks like,
 * so signup / login / logout can never disagree about the name or options.
 */

export const SESSION_COOKIE_NAME = "teamhub_session"

export type SessionMaxAge = "short" | "medium" | "long"

// Seconds — what cookie `maxAge` and DB expiry both use.
const maxAgeMap: Record<SessionMaxAge, number> = {
  short: 60 * 60 * 24 * 1, // 1 day  — login without remember me
  medium: 60 * 60 * 24 * 7, // 7 days — signup / Google default
  long: 60 * 60 * 24 * 30, // 30 days — login with remember me
}

export function getSessionMaxAgeSeconds(maxAge: SessionMaxAge): number {
  return maxAgeMap[maxAge]
}

/** Shared cookie flags; pass maxAge per session so DB + cookie stay in sync. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    // JavaScript in the browser cannot read this cookie (blocks XSS token theft).
    httpOnly: true,
    // Sent on normal navigation to our site, not on cross-site POSTs (blocks CSRF).
    sameSite: "lax" as const,
    // HTTPS only in production; must be false on http://localhost or the browser drops it.
    secure: process.env.NODE_ENV === "production",
    // Cookie is sent for every path of the app, not just /api/auth.
    path: "/",
    maxAge: maxAgeSeconds,
  }
}
