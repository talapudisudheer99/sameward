import { NextResponse } from "next/server"
import { Types } from "mongoose"

import {
  destroySession,
  getCurrentUser,
  getRawSessionToken,
  hashToken,
} from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { Session } from "@/lib/models/session"

type RouteParams = {
  params: Promise<{ sessionId: string }>
}

/**
 * DELETE /api/auth/sessions/[sessionId] — revoke one device session.
 * Revoking the current session logs this browser out.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params
  if (!Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  await connectDB()
  const row = await Session.findOne({ _id: sessionId, userId: user.id })
  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const raw = await getRawSessionToken()
  const isCurrent = raw != null && row.tokenHash === hashToken(raw)

  if (isCurrent) {
    await destroySession()
    return NextResponse.json(
      { message: "Signed out", current: true },
      { status: 200 }
    )
  }

  await Session.deleteOne({ _id: row._id })
  return NextResponse.json(
    { message: "Session ended", current: false },
    { status: 200 }
  )
}
