import { NextResponse } from "next/server"

import { destroyAllSessions, getCurrentUser } from "@/lib/auth/session"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await destroyAllSessions(user.id)

    return NextResponse.json(
      { message: "Logged out from all devices" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Logout-all failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
