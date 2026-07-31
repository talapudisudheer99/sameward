import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { User } from "@/lib/models/user"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import { WorkspaceInvite } from "@/lib/models/workspace/workspace-invite"
import { findPendingInviteByRawToken } from "@/lib/workspaces/invite"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"

/**
 * Map lookup errors → HTTP (same shape for GET + POST).
 * 410 = link no longer usable (expired / already used).
 */
function inviteErrorResponse(error: "not_found" | "expired" | "accepted") {
  if (error === "expired") {
    return NextResponse.json(
      { message: "This invite has expired" },
      { status: 410 }
    )
  }
  if (error === "accepted") {
    return NextResponse.json(
      { message: "This invite was already accepted" },
      { status: 410 }
    )
  }
  return NextResponse.json({ message: "Invite not found" }, { status: 404 })
}

/**
 * GET /api/invites/[token]
 * Preview a pending invite (for the accept page). No login required to *see*
 * who was invited — accept still requires the matching session.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await findPendingInviteByRawToken(token)

    if (result.error) {
      return inviteErrorResponse(result.error)
    }

    const { invite } = result
    const workspace = await Workspace.findById(invite.workspaceId)

    // Workspace deleted after invite was sent
    if (!workspace) {
      return NextResponse.json({ message: "Invite not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        email: invite.email,
        workspaceId: workspace._id.toString(),
        workspaceName: workspace.name,
        expiresAt: invite.expiresAt.toISOString(),
        status: "pending" as const,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to load invite:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invites/[token]
 * Accept invite → Membership (member) + consume invite.
 * Side effect: if invitee was unverified, mark emailVerified (inbox proof).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // 1) Must be logged in
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { token } = await params
    const result = await findPendingInviteByRawToken(token)

    if (result.error) {
      return inviteErrorResponse(result.error)
    }

    const { invite } = result

    // 2) Session email must match the invite (prevents accepting someone else's link)
    if (user.email !== invite.email) {
      return NextResponse.json(
        {
          message: `Sign in as ${invite.email} to accept this invite`,
          requiredEmail: invite.email,
        },
        { status: 403 }
      )
    }

    const workspaceId = invite.workspaceId.toString()

    // 3) Membership — create if needed (idempotent if already a member)
    let role: string = MembershipRole.Member
    const existing = await Membership.findOne({
      workspaceId: invite.workspaceId,
      userId: user.id,
    })

    if (existing) {
      role = existing.role
    } else {
      await Membership.create({
        workspaceId: invite.workspaceId,
        userId: user.id,
        role: MembershipRole.Member,
      })
    }

    // 4) Consume invite (single-use)
    await WorkspaceInvite.findByIdAndUpdate(invite._id, {
      acceptedAt: new Date(),
    })

    // 5) Optional verify — clicking a link only they received ≈ inbox ownership
    if (!user.emailVerified) {
      await User.findByIdAndUpdate(user.id, { emailVerified: true })
    }

    await logWorkspaceEvent({
      event: WorkspaceAuditEvent.InviteAccepted,
      success: true,
      workspaceId,
      actorUserId: user.id,
      email: user.email,
    })

    return NextResponse.json(
      {
        workspaceId,
        role,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to accept invite:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
