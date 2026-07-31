import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import roleUpdateSchema from "@/lib/schemas/workspace/role-update-schema"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"

/**
 * DELETE /api/workspaces/[workspaceId]/members/[userId]
 * Owner/admin removes another member.
 * Self → use leave (…/members/me). Cannot remove an owner.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, userId } = await params

    // Same 404 as other workspace routes — no existence leak
    if (
      !workspaceId ||
      !userId ||
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    // Caller must belong here
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
        { message: "Only owners and admins can remove members" },
        { status: 403 }
      )
    }

    // Self-remove belongs on …/members/me (leave)
    if (userId === user.id) {
      return NextResponse.json(
        { message: "Use leave to remove yourself from this workspace" },
        { status: 400 }
      )
    }

    const targetMembership = await Membership.findOne({
      workspaceId,
      userId,
    })
    if (!targetMembership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    // Never kick the owner via this route (transfer ownership = later)
    if (targetMembership.role === MembershipRole.Owner) {
      return NextResponse.json(
        { message: "Cannot remove the workspace owner" },
        { status: 403 }
      )
    }

    await Membership.deleteOne({
      workspaceId,
      userId,
    })

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.MemberRemoved,
      success: true,
      workspaceId,
      actorUserId: user.id,
      targetUserId: userId,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to remove member:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/members/[userId]
 * Owner-only: set role to member | admin (not owner — transfer later).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, userId } = await params

    if (
      !workspaceId ||
      !userId ||
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(userId)
    ) {
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

    // Only the owner may promote/demote (Phase 3.6 lock)
    if (callerMembership.role !== MembershipRole.Owner) {
      return NextResponse.json(
        { message: "Only the owner can change member roles" },
        { status: 403 }
      )
    }

    const targetMembership = await Membership.findOne({ workspaceId, userId })
    if (!targetMembership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    // Owner role is not editable here (transfer ownership = later)
    if (targetMembership.role === MembershipRole.Owner) {
      return NextResponse.json(
        { message: "Cannot change the owner's role" },
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

    const parsedData = roleUpdateSchema.safeParse(body)
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { role } = parsedData.data

    // Idempotent — same role is success
    if (targetMembership.role === role) {
      return NextResponse.json({ userId, role }, { status: 200 })
    }

    await Membership.updateOne({ workspaceId, userId }, { $set: { role } })

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.RoleChanged,
      success: true,
      workspaceId,
      actorUserId: user.id,
      targetUserId: userId,
      reason: role,
    })

    return NextResponse.json({ userId, role }, { status: 200 })
  } catch (error) {
    console.error("Failed to update member role:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
