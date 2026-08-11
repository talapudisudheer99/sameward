import { NextResponse } from "next/server"

import { formatDeviceLabel } from "@/lib/auth/device-label"
import {
  getCurrentUser,
  getRawSessionToken,
  hashToken,
} from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { MAX_SESSIONS_PER_USER, Session } from "@/lib/models/session"

/**
 * GET /api/auth/sessions — list this user’s active device sessions.
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const raw = await getRawSessionToken()
  const currentHash = raw ? hashToken(raw) : null

  const rows = await Session.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .lean()

  const sessions = rows.map((s) => ({
    id: String(s._id),
    deviceLabel: formatDeviceLabel(s.userAgent),
    ip: s.ip || null,
    createdAt: (s.createdAt as Date).toISOString(),
    expiresAt: new Date(s.expiresAt).toISOString(),
    current: currentHash != null && s.tokenHash === currentHash,
  }))

  return NextResponse.json(
    {
      sessions,
      maxSessions: MAX_SESSIONS_PER_USER,
    },
    { status: 200 }
  )
}
