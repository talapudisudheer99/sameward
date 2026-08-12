import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"
import { Membership } from "@/lib/models/workspace/membership"
import { serializeProfile } from "@/lib/profile/serialize-profile"

type RouteContext = {
  params: Promise<{ workspaceId: string; userId: string }>
}

/**
 * GET /api/workspaces/:workspaceId/profiles/:userId
 * Teammate card — viewer + subject must both be workspace members (else 404).
 */
export async function GET(_req: Request, context: RouteContext) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { workspaceId, userId } = await context.params
  if (!workspaceId || !userId) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  await connectDB()

  const [viewerMembership, subjectMembership] = await Promise.all([
    Membership.findOne({ workspaceId, userId: sessionUser.id }).lean(),
    Membership.findOne({ workspaceId, userId }).lean(),
  ])

  if (!viewerMembership || !subjectMembership) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const user = await User.findById(userId)
  if (!user) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  const profile = await serializeProfile(user)
  return NextResponse.json({ profile }, { status: 200 })
}
