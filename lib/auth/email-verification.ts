import { randomBytes } from "node:crypto"

import { sendVerificationEmail } from "@/lib/auth/email"
import { hashToken } from "@/lib/auth/session"
import { EmailVerificationToken } from "@/lib/models/email-verification-token"

const VERIFICATION_MAX_AGE_MS = 1000 * 60 * 60 * 24 // 24 hours

/**
 * Creates a one-time verification token and emails the link.
 * Does NOT return an HTTP response — callers (signup / resend) decide that.
 */
export async function createAndSendVerification(
  userId: string,
  email: string
): Promise<void> {
  await EmailVerificationToken.deleteMany({ userId })

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + VERIFICATION_MAX_AGE_MS)

  await EmailVerificationToken.create({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
  })

  const appUrl = process.env.APP_URL ?? "http://localhost:3000"
  // Must match Step 7 route: GET /api/auth/verify-email
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`

  await sendVerificationEmail({
    to: email,
    verifyUrl,
  })
}
