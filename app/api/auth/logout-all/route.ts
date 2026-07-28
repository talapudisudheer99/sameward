import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/audit"
import { getClientIp } from "@/lib/auth/rate-limit"
import { destroyAllSessions, getCurrentUser } from "@/lib/auth/session"

export async function POST(request: Request) {
  const ip = getClientIp(request)

  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await destroyAllSessions(user.id)

    await logAuthEvent({
      event: "logout_all",
      success: true,
      email: user.email,
      userId: user.id,
      ip,
    })

    return NextResponse.json(
      { message: "Logged out from all devices" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Logout-all failed:", error)
    await logAuthEvent({
      event: "logout_all",
      success: false,
      ip,
      reason: "internal_error",
    })
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
