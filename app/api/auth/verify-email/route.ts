import { NextResponse } from "next/server"

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
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    return redirectWithError(request, "Missing verification link")
  }

  try {
    await connectDB()

    const record = await EmailVerificationToken.findOne({
      tokenHash: hashToken(token),
    })

    if (!record) {
      return redirectWithError(request, "Invalid or expired verification link")
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await EmailVerificationToken.deleteOne({ _id: record._id })
      return redirectWithError(request, "Invalid or expired verification link")
    }

    const user = await User.findById(record.userId)

    if (!user) {
      await EmailVerificationToken.deleteOne({ _id: record._id })
      return redirectWithError(request, "Invalid or expired verification link")
    }

    await User.updateOne({ _id: user._id }, { $set: { emailVerified: true } })

    // One-time use
    await EmailVerificationToken.deleteOne({ _id: record._id })

    // Cache-bust so the app layout re-reads emailVerified
    return NextResponse.redirect(new URL("/workspace", request.url))
  } catch (error) {
    console.error("Verify email failed:", error)
    return redirectWithError(request, "Could not verify email")
  }
}
