/**
 * Single place that defines what our session cookie looks like,
 * so signup / login / logout can never disagree about the name or options.
 */

export const SESSION_COOKIE_NAME = "teamhub_session"

// 7 days, expressed in seconds because that is what `maxAge` expects.
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export const sessionCookieOptions = {
  // JavaScript in the browser cannot read this cookie (blocks XSS token theft).
  httpOnly: true,
  // Sent on normal navigation to our site, not on cross-site POSTs (blocks CSRF).
  sameSite: "lax" as const,
  // HTTPS only in production; must be false on http://localhost or the browser drops it.
  secure: process.env.NODE_ENV === "production",
  // Cookie is sent for every path of the app, not just /api/auth.
  path: "/",
  // Browser deletes the cookie after this many seconds.
  maxAge: SESSION_MAX_AGE_SECONDS,
}
