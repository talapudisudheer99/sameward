import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"

/**
 * DELETE /api/workspaces/[workspaceId]/members/me
 * Leave this workspace (delete my membership).
 *
 * Sole owner cannot leave — would orphan the tenant.
 * Use transfer (later) or DELETE workspace (T36) instead.
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

    // Same 404 as get-one — don't leak whether the id is valid
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

    // Sole owner guard — leave ≠ delete workspace
    if (membership.role === MembershipRole.Owner) {
      const ownerCount = await Membership.countDocuments({
        workspaceId,
        role: MembershipRole.Owner,
      })

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            message:
              "Transfer ownership or delete the workspace before leaving",
          },
          { status: 400 }
        )
      }
    }

    // Any role (member / admin / non-sole owner) — remove only MY row
    await Membership.deleteOne({
      workspaceId,
      userId: user.id,
    })

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.MemberLeft,
      success: true,
      workspaceId,
      actorUserId: user.id,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to leave workspace:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
