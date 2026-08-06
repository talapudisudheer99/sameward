import { randomBytes } from "node:crypto" // Node's built-in crypto — no package to install

import { cookies } from "next/headers" // read/write cookies inside Route Handlers

import { connectDB } from "@/lib/db/mongoose"
import { Session } from "@/lib/models/session"

import {
  SESSION_COOKIE_NAME,
  getSessionMaxAgeSeconds,
  sessionCookieOptions,
} from "./cookies"
import { hashToken, resolveUserFromSessionToken } from "./session-user"

// Re-export so existing `@/lib/auth/session` imports keep working.
export { hashToken, resolveUserFromSessionToken }
export type { SessionUser } from "./session-user"

/**
 * Called after a successful signup or login.
 * 1. invent a random token
 * 2. save its hash + owner + expiry in Mongo
 * 3. send the raw token to the browser as an httpOnly cookie
 *
 * rememberMe:
 *   true  → 30 days
 *   false → 1 day
 *   omitted (signup / Google) → 7 days
 */
export async function createSession(
  userId: string,
  rememberMe?: boolean
): Promise<void> {
  await connectDB()

  // 32 random bytes -> 64 hex characters. Unguessable, unlike an incrementing id.
  const token = randomBytes(32).toString("hex")

  // Pick lifetime — cookie maxAge and DB expiresAt must use the SAME seconds.
  let maxAgeSeconds: number
  if (rememberMe === true) {
    maxAgeSeconds = getSessionMaxAgeSeconds("long")
  } else if (rememberMe === false) {
    maxAgeSeconds = getSessionMaxAgeSeconds("short")
  } else {
    maxAgeSeconds = getSessionMaxAgeSeconds("medium")
  }

  // Date.now() is milliseconds, our max age is seconds, hence * 1000.
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000)

  await Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  })

  // `cookies()` is async in Next 16 — it must be awaited.
  const cookieStore = await cookies()
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(maxAgeSeconds)
  )
}

/**
 * "Who is making this request?" — used by /api/auth/me and protected routes.
 * Returns null when there is no valid session.
 * Cookie read is Next-only; identity lookup is shared with realtime via session-user.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value // undefined when no cookie
  if (!token) return null

  return resolveUserFromSessionToken(token)
}

/**
 * Logout: delete the row so the token is dead server-side,
 * then tell the browser to drop the cookie.
 */

export async function destroySession(): Promise<void> {
  await connectDB()

  const cookiesStore = await cookies()

  const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    // must await — otherwise logout may return before the DB row is deleted
    await Session.deleteOne({ tokenHash: hashToken(token) })
  }

  cookiesStore.delete(SESSION_COOKIE_NAME)
}

/** Kill every session for this user (all devices), then clear this browser's cookie */
export async function destroyAllSessions(userId: string): Promise<void> {
  await connectDB()

  await Session.deleteMany({ userId })

  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
