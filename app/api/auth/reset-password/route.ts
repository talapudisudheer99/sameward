import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/audit"
import { hashPassword } from "@/lib/auth/password"
import { getClientIp } from "@/lib/auth/rate-limit"
import { hashToken } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { PasswordResetToken } from "@/lib/models/password-reset-token"
import { Session } from "@/lib/models/session"
import { User } from "@/lib/models/user"
import resetPasswordSchema from "@/lib/schemas/auth/reset-password-schema"

export async function POST(request: Request) {
  const ip = getClientIp(request)

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

    const parsed = resetPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    await connectDB()

    const resetToken = await PasswordResetToken.findOne({
      tokenHash: hashToken(token),
    })

    if (!resetToken) {
      await logAuthEvent({
        event: "reset_password.failure",
        success: false,
        ip,
        reason: "invalid_or_expired_token",
      })
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      await logAuthEvent({
        event: "reset_password.failure",
        success: false,
        userId: resetToken.userId.toString(),
        ip,
        reason: "invalid_or_expired_token",
      })
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 }
      )
    }

    const user = await User.findById(resetToken.userId)

    if (!user) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      await logAuthEvent({
        event: "reset_password.failure",
        success: false,
        userId: resetToken.userId.toString(),
        ip,
        reason: "user_not_found",
      })
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 }
      )
    }

    user.passwordHash = await hashPassword(password)
    await user.save()

    // Token is one-time use
    await PasswordResetToken.deleteOne({ _id: resetToken._id })

    // Old sessions should not stay valid after a password change
    await Session.deleteMany({ userId: user._id })

    await logAuthEvent({
      event: "reset_password.success",
      success: true,
      email: user.email,
      userId: user._id.toString(),
      ip,
    })

    // Client navigates to /login — API only returns JSON (no redirect here)
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password failed:", error)
    await logAuthEvent({
      event: "reset_password.failure",
      success: false,
      ip,
      reason: "internal_error",
    })

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
