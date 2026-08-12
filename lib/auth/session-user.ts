import { createHash } from "node:crypto"

import { connectDB } from "@/lib/db/mongoose"
import { Session } from "@/lib/models/session"
import { User } from "@/lib/models/user"

/**
 * Next-free session helpers.
 * Safe to import from the realtime Node process (no `next/headers`).
 */

export type SessionUser = {
  id: string
  fullName: string
  email: string
  emailVerified: boolean
}

/** Same fingerprint REST stores in Session.tokenHash. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Cookie / handshake raw token → public user fields, or null if invalid/expired.
 */
export async function resolveUserFromSessionToken(
  token: string
): Promise<SessionUser | null> {
  await connectDB()

  const session = await Session.findOne({ tokenHash: hashToken(token) })
  if (!session) return null

  if (session.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ _id: session._id })
    return null
  }

  const user = await User.findById(session.userId)
  if (!user) return null

  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    emailVerified: user.emailVerified === true,
  }
}
