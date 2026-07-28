import { createHash, randomBytes } from "node:crypto" // Node's built-in crypto — no package to install

import { cookies } from "next/headers" // read/write cookies inside Route Handlers

import { connectDB } from "@/lib/db/mongoose"
import { Session } from "@/lib/models/session"
import { User } from "@/lib/models/user"

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieOptions,
} from "./cookies"

/**
 * Turn the raw token into a fixed-length fingerprint.
 * Same input always gives the same output, but you cannot go backwards.
 * The browser holds the raw token; the DB only holds this hash.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Called after a successful signup or login.
 * 1. invent a random token
 * 2. save its hash + owner + expiry in Mongo
 * 3. send the raw token to the browser as an httpOnly cookie
 */
export async function createSession(userId: string): Promise<void> {
  await connectDB()

  // 32 random bytes -> 64 hex characters. Unguessable, unlike an incrementing id.
  const token = randomBytes(32).toString("hex")

  // Date.now() is milliseconds, our max age is seconds, hence * 1000.
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await Session.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  })

  // `cookies()` is async in Next 16 — it must be awaited.
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions)
}

/**
 * "Who is making this request?" — used by /api/auth/me and protected routes.
 * Returns null when there is no valid session.
 */
export async function getCurrentUser() {
  await connectDB()

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value // undefined when no cookie
  if (!token) return null

  // Look up by hash, because the hash is what we stored.
  const session = await Session.findOne({ tokenHash: hashToken(token) })
  if (!session) return null // cookie is fake, or session was deleted by logout

  // Mongo's TTL cleaner runs about once a minute, so also check the date ourselves.
  if (session.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ _id: session._id })
    return null
  }

  const user = await User.findById(session.userId)
  if (!user) return null // user deleted but session left behind

  // Return only safe fields — never the passwordHash.
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    emailVerified: user.emailVerified === true,
  }
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
