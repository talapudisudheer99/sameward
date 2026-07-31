import { NextResponse } from "next/server" // helper to build JSON HTTP responses

import { logAuthEvent } from "@/lib/auth/auth-audit-logger"
import { hashPassword } from "@/lib/auth/password" // bcrypt hash — never store plain password
import { createSession } from "@/lib/auth/session" // creates session row + sets the cookie
import { connectDB } from "@/lib/db/mongoose" // opens / reuses the Mongo connection
import { User } from "@/lib/models/user" // Mongoose model for the users collection
import signupSchema from "@/lib/schemas/auth/signup-schema" // Zod schema shared with the form
import { createAndSendVerification } from "@/lib/auth/email-verification"
import {
  getClientIp,
  rateLimit,
  tooManyRequestsResponse,
} from "@/lib/auth/rate-limit"

/**
 * POST /api/auth/signup
 * Creates a user, then logs them in by starting a session.
 *
 * Login is the mirror image: parse → validate → find user → verifyPassword → createSession.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limited = rateLimit({
    key: `signup:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })

  if (!limited.ok) {
    await logAuthEvent({
      event: "rate_limit.hit",
      success: false,
      ip,
      reason: "signup",
    })
    return tooManyRequestsResponse(limited.retryAfterSeconds)
  }

  let emailForLog: string | undefined

  try {
    await connectDB() // ensure DB is ready before any query

    // --- 1) Parse JSON body ---
    let body: unknown // unknown = we don't trust the client shape yet
    try {
      body = await request.json() // reads and parses the request body as JSON
    } catch {
      // client sent empty body or invalid JSON
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 } // 400 = bad request
      )
    }

    // --- 2) Validate with Zod (same rules as the signup form) ---
    const parsed = signupSchema.safeParse(body) // safeParse never throws; returns success/error
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(), // field-level errors for debugging / UI later
        },
        { status: 400 }
      )
    }

    // only after success do we use typed fields
    const { fullName, email, password } = parsed.data
    emailForLog = email

    // confirmPassword is only for matching — do NOT save it to Mongo

    // --- 3) Reject duplicate email ---
    const existing = await User.findOne({ email }) // email already lowercased by Zod + schema
    if (existing) {
      await logAuthEvent({
        event: "signup.failure",
        success: false,
        email,
        ip,
        reason: "email_already_registered",
      })
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 } // 409 = conflict
      )
    }

    // --- 4) Hash password, then create user ---
    const passwordHash = await hashPassword(password) // one-way hash with salt rounds 12

    const user = await User.create({
      fullName,
      email,
      passwordHash, // store hash only — never `password`
      emailVerified: false,
    })

    // Soft gate: if Resend fails, still create the session so signup isn't blocked
    try {
      await createAndSendVerification(String(user._id), email)
    } catch (error) {
      console.error("Verification email failed:", error)
    }

    await createSession(String(user._id))

    await logAuthEvent({
      event: "signup.success",
      success: true,
      email: user.email,
      userId: user._id.toString(),
      ip,
    })

    return NextResponse.json(
      {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        emailVerified: false,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    // race: two signups with same email at once can hit unique index
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000 // Mongo duplicate key error
    ) {
      await logAuthEvent({
        event: "signup.failure",
        success: false,
        email: emailForLog,
        ip,
        reason: "email_already_registered",
      })
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      )
    }

    console.error("Signup failed:", error) // log server-side; never log the password

    await logAuthEvent({
      event: "signup.failure",
      success: false,
      email: emailForLog,
      ip,
      reason: "internal_error",
    })

    return NextResponse.json(
      { message: "Something went wrong" }, // generic message to the client
      { status: 500 }
    )
  }
}
