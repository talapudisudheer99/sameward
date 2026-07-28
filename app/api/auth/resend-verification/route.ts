import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/audit"
import { createAndSendVerification } from "@/lib/auth/email-verification"
import {
  getClientIp,
  rateLimit,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limited = rateLimit({
    key: `resend-verification:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })

  if (!limited.ok) {
    await logAuthEvent({
      event: "rate_limit.hit",
      success: false,
      ip,
      reason: "resend_verification",
    })
    return tooManyRequestsResponse(limited.retryAfterSeconds)
  }

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      )
    }

    await createAndSendVerification(user.id, user.email)

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification failed:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
