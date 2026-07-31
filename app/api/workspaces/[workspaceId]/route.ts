import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import { WorkspaceInvite } from "@/lib/models/workspace/workspace-invite"
import workSpaceSchema from "@/lib/schemas/workspace/workspace-schema"
import { slugifyUnique } from "@/lib/workspaces/slugify"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"

/**
 * GET /api/workspaces/[workspaceId]
 * Return one workspace + my role — only if I am a member.
 * Non-member / missing / bad id → same 404 (no existence leak).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Dynamic segment from /api/workspaces/[workspaceId] — not a query string
    const { workspaceId } = await params

    // Bad / empty id looks the same as "not found" (don't leak validity)
    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    // Gate by membership first — belonging is the tenant boundary
    const membership = await Membership.findOne({
      workspaceId,
      userId: user.id,
    })
    if (!membership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      role: membership.role,
    })
  } catch (error) {
    console.error("Failed to get workspace:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]
 * Owner-only: destroy the tenant + cascade invites and ALL memberships.
 * No email notify (Phase 3.5 lock).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    // Same 404 as GET — don't leak id validity
    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    const membership = await Membership.findOne({
      workspaceId,
      userId: user.id,
    })
    if (!membership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    // Admin / member cannot wipe the tenant
    if (membership.role !== MembershipRole.Owner) {
      return NextResponse.json(
        { message: "Only the owner can delete this workspace" },
        { status: 403 }
      )
    }

    // Cascade: children first, then workspace (avoids orphan rows)
    await WorkspaceInvite.deleteMany({ workspaceId })
    await Membership.deleteMany({ workspaceId })
    await Workspace.deleteOne({ _id: workspaceId })

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.Deleted,
      success: true,
      workspaceId,
      actorUserId: user.id,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to delete workspace:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]
 * Owner/admin rename — updates name + unique slug (excludes self).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    const callerMembership = await Membership.findOne({
      workspaceId,
      userId: user.id,
    })
    if (!callerMembership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    if (
      callerMembership.role !== MembershipRole.Owner &&
      callerMembership.role !== MembershipRole.Admin
    ) {
      return NextResponse.json(
        { message: "Only owners and admins can update this workspace" },
        { status: 403 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsedData = workSpaceSchema.safeParse(body)
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { name } = parsedData.data
    // Exclude this workspace so renaming “Acme” → “Acme” (or similar) doesn’t become acme-2
    const slug = await slugifyUnique(name, workspaceId)

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { name, slug },
      { new: true }
    )

    if (!updatedWorkspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.Renamed,
      success: true,
      workspaceId,
      actorUserId: user.id,
    })

    return NextResponse.json(
      {
        id: updatedWorkspace._id.toString(),
        name: updatedWorkspace.name,
        slug: updatedWorkspace.slug,
        role: callerMembership.role,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to update workspace:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
