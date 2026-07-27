import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"

import { sendPasswordResetEmail } from "@/lib/auth/email"
import { hashToken } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { PasswordResetToken } from "@/lib/models/password-reset-token"
import { User } from "@/lib/models/user"
import forgotPasswordSchema from "@/lib/schemas/auth/forgot-password-schema"

const RESET_MAX_AGE_MS = 1000 * 60 * 30 // 30 minutes

// Same message whether the email exists or not — no account enumeration
const OK_MESSAGE = "If an account exists for that email, we sent a reset link."

export async function POST(request: Request) {
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

    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { email } = parsed.data
    const appUrl = process.env.APP_URL ?? "http://localhost:3000"

    await connectDB()

    const user = await User.findOne({ email })

    // Always look successful to the client
    if (!user) {
      return NextResponse.json({ message: OK_MESSAGE }, { status: 200 })
    }

    // One active reset token per user
    await PasswordResetToken.deleteMany({ userId: user._id })

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + RESET_MAX_AGE_MS)

    await PasswordResetToken.create({
      tokenHash: hashToken(token),
      userId: user._id,
      expiresAt,
    })

    const resetUrl = `${appUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    })

    return NextResponse.json({ message: OK_MESSAGE }, { status: 200 })
  } catch (error) {
    console.error("Forgot password failed:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
