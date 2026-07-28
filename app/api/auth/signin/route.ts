import { NextResponse } from "next/server"

import { verifyPassword } from "@/lib/auth/password"
import {
  getClientIp,
  rateLimit,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit"
import { createSession } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import loginSchema from "@/lib/schemas/auth/login-schema"

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limited = rateLimit({
    key: `signin:${ip}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })

  // Must return — otherwise 429 is created and thrown away
  if (!limited.ok) {
    return tooManyRequestsResponse(limited.retryAfterSeconds)
  }

  try {
    await connectDB()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid json body" },
        { status: 400 }
      )
    }

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await User.findOne({ email }).select("+passwordHash")

    // Same message for: no user, Google-only (no password), or wrong password
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    await createSession(user._id.toString())

    return NextResponse.json(
      {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
