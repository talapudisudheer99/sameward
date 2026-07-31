import { NextResponse } from "next/server"

import { logAuthEvent } from "@/lib/auth/auth-audit-logger"
import { destroySession, getCurrentUser } from "@/lib/auth/session"
import { getClientIp } from "@/lib/auth/rate-limit"

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const user = await getCurrentUser()

  await destroySession()

  await logAuthEvent({
    event: "logout",
    success: true,
    email: user?.email,
    userId: user?.id,
    ip,
  })

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  )
}
