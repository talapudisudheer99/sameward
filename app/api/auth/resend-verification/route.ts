import { NextResponse } from "next/server"

import { createAndSendVerification } from "@/lib/auth/email-verification"
import { getCurrentUser } from "@/lib/auth/session"

export async function POST() {
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
