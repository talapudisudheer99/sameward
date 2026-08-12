import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import { Membership } from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import workSpaceSchema from "@/lib/schemas/workspace/workspace-schema"
import { createWorkspaceForUser } from "@/lib/workspaces/create-workspace"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"

/**
 * POST /api/workspaces — create a workspace (caller becomes owner)
 * GET  /api/workspaces — list workspaces I belong to (via Membership)
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

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

    const raw =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {}
    const parsed = workSpaceSchema.safeParse({
      ...raw,
      description: raw.description ?? "",
    })
    if (!parsed.success) {
      // Must pass status as the 2nd arg — comma operator would return { status: 400 } alone
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { name, description } = parsed.data
    const { workspace, role } = await createWorkspaceForUser(
      user.id,
      name,
      description
    )

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.Created,
      success: true,
      workspaceId: workspace._id.toString(),
      actorUserId: user.id,
    })

    return NextResponse.json(
      {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description ?? "",
        role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Workspace creation failed:", error)
    return NextResponse.json(
      { message: "Failed to create workspace" },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Session required — /api/* is outside proxy matcher
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    // 1) Membership = "teams I belong to" (owner/admin/member) — not ownerId alone
    const memberships = await Membership.find({ userId: user.id })

    // Empty is a valid product state → UI shows "Create your first workspace"
    if (memberships.length === 0) {
      return NextResponse.json({ workspaces: [] }, { status: 200 })
    }

    // 2) Load workspace docs for those ids ($in = "any of these")
    //Give me every workspace whose _id is inside this array.
    const workspaces = await Workspace.find({
      _id: { $in: memberships.map((m) => m.workspaceId) },
    })

    // 3) Map workspaceId → role so we can attach role without nested loops
    const roleByWorkspaceId = new Map(
      memberships.map((m) => [m.workspaceId.toString(), m.role])
    )

    // 4) Shape a safe client payload (string ids + role from membership)
    const result = workspaces.map((ws) => {
      return {
        id: ws._id.toString(),
        name: ws.name,
        slug: ws.slug,
        description: ws.description ?? "",
        role: roleByWorkspaceId.get(ws._id.toString()),
      }
    })

    return NextResponse.json({ workspaces: result }, { status: 200 })
  } catch (error) {
    console.error("Failed to get workspaces:", error)
    return NextResponse.json(
      { message: "Failed to get workspaces" },
      { status: 500 }
    )
  }
}
