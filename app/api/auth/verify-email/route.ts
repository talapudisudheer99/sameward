import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/auth-audit-logger"
import { getClientIp } from "@/lib/auth/rate-limit"
import { hashToken } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { EmailVerificationToken } from "@/lib/models/email-verification-token"
import { User } from "@/lib/models/user"

function redirectWithError(request: Request, message: string) {
  const url = new URL("/login", request.url)
  url.searchParams.set("error", message)
  return NextResponse.redirect(url)
}

/**
 * GET /api/auth/verify-email?token=...
 * User clicks this link from the email.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request)
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    await logAuthEvent({
      event: "verify_email.failure",
      success: false,
      ip,
      reason: "missing_token",
    })
    return redirectWithError(request, "Missing verification link")
  }

  try {
    await connectDB()

    const record = await EmailVerificationToken.findOne({
      tokenHash: hashToken(token),
    })

    if (!record) {
      await logAuthEvent({
        event: "verify_email.failure",
        success: false,
        ip,
        reason: "invalid_or_expired_token",
      })
      return redirectWithError(request, "Invalid or expired verification link")
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await EmailVerificationToken.deleteOne({ _id: record._id })
      await logAuthEvent({
        event: "verify_email.failure",
        success: false,
        userId: record.userId.toString(),
        ip,
        reason: "invalid_or_expired_token",
      })
      return redirectWithError(request, "Invalid or expired verification link")
    }

    const user = await User.findById(record.userId)

    if (!user) {
      await EmailVerificationToken.deleteOne({ _id: record._id })
      await logAuthEvent({
        event: "verify_email.failure",
        success: false,
        userId: record.userId.toString(),
        ip,
        reason: "user_not_found",
      })
      return redirectWithError(request, "Invalid or expired verification link")
    }

    await User.updateOne({ _id: user._id }, { $set: { emailVerified: true } })

    // One-time use
    await EmailVerificationToken.deleteOne({ _id: record._id })

    await logAuthEvent({
      event: "verify_email.success",
      success: true,
      email: user.email,
      userId: user._id.toString(),
      ip,
    })

    // Cache-bust so the app layout re-reads emailVerified
    return NextResponse.redirect(new URL("/workspace", request.url))
  } catch (error) {
    console.error("Verify email failed:", error)
    await logAuthEvent({
      event: "verify_email.failure",
      success: false,
      ip,
      reason: "internal_error",
    })
    return redirectWithError(request, "Could not verify email")
  }
}
