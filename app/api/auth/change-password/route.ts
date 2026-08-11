import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { logAuthEvent } from "@/lib/auth/auth-audit-logger"
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { getClientIp } from "@/lib/auth/rate-limit"
import { getCurrentUser, hashToken } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { Session } from "@/lib/models/session"
import { User } from "@/lib/models/user"
import changePasswordSchema from "@/lib/schemas/auth/change-password-schema"

/**
 * POST /api/auth/change-password — authenticated password change.
 * Keeps this browser’s session; ends all other sessions.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request)
  const sessionUser = await getCurrentUser()

  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    await connectDB()
    const user = await User.findById(sessionUser.id).select("+passwordHash")
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!user.passwordHash) {
      await logAuthEvent({
        event: "change_password.failure",
        success: false,
        userId: user._id.toString(),
        email: user.email,
        ip,
        reason: "no_password",
      })
      return NextResponse.json(
        {
          message:
            "This account has no password yet. Use Forgot password to set one.",
        },
        { status: 400 }
      )
    }

    const ok = await verifyPassword(currentPassword, user.passwordHash)
    if (!ok) {
      await logAuthEvent({
        event: "change_password.failure",
        success: false,
        userId: user._id.toString(),
        email: user.email,
        ip,
        reason: "wrong_current_password",
      })
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      )
    }

    user.passwordHash = await hashPassword(newPassword)
    await user.save()

    // Revoke other devices; keep this session
    const cookieStore = await cookies()
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (raw) {
      await Session.deleteMany({
        userId: user._id,
        tokenHash: { $ne: hashToken(raw) },
      })
    } else {
      await Session.deleteMany({ userId: user._id })
    }

    await logAuthEvent({
      event: "change_password.success",
      success: true,
      userId: user._id.toString(),
      email: user.email,
      ip,
    })

    return NextResponse.json(
      { message: "Password updated" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Change password failed:", error)
    await logAuthEvent({
      event: "change_password.failure",
      success: false,
      userId: sessionUser.id,
      ip,
      reason: "internal_error",
    })
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
