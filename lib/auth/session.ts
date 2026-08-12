import { randomBytes } from "node:crypto" // Node's built-in crypto — no package to install

import { cookies, headers } from "next/headers" // read/write cookies inside Route Handlers

import { connectDB } from "@/lib/db/mongoose"
import { MAX_SESSIONS_PER_USER, Session } from "@/lib/models/session"

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
 * Enforces MAX_SESSIONS_PER_USER by expiring the oldest session(s) first.
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

  const h = await headers()
  const userAgent = (h.get("user-agent") ?? "").slice(0, 512)
  const forwarded = h.get("x-forwarded-for")
  const ip = (
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    ""
  ).slice(0, 64)

  // Cap concurrent devices: drop oldest so this login can proceed.
  const existing = await Session.find({ userId }).sort({ createdAt: 1 })
  const overflow = existing.length - (MAX_SESSIONS_PER_USER - 1)
  if (overflow > 0) {
    const victimIds = existing.slice(0, overflow).map((s) => s._id)
    await Session.deleteMany({ _id: { $in: victimIds } })
  }

  await Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
    userAgent,
    ip,
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

/** Raw session cookie value for this request (or null). */
export async function getRawSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
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
