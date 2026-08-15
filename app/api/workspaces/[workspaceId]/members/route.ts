import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { sendWorkspaceInviteEmail } from "@/lib/auth/email"
import { getCurrentUser } from "@/lib/auth/session"
import { User } from "@/lib/models/user"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import { WorkspaceInvite } from "@/lib/models/workspace/workspace-invite"
import addMemberSchema from "@/lib/schemas/workspace/add-member-schema"
import {
  buildInviteUrl,
  createInviteToken,
  inviteExpiresAt,
} from "@/lib/workspaces/invite"
import { WorkspaceAuditEvent } from "@/lib/workspaces/workspace-audit-events"
import { logWorkspaceEvent } from "@/lib/workspaces/workspace-audit-logger"
import { presignAttachmentGet } from "@/lib/storage/s3"

type InviteFailureReason =
  "not_found" | "already_member" | "invite_failed" | "email_send_failed"

/**
 * POST /api/workspaces/[workspaceId]/members
 * Owner/admin (emailVerified) sends invites — does NOT create Membership.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { message: "Verify your email to invite teammates" },
      { status: 403 }
    )
  }

  const { workspaceId } = await params

  if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
    return NextResponse.json(
      { message: "Workspace not found" },
      { status: 404 }
    )
  }

  // Caller must belong to this workspace
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

  if (
    membership.role !== MembershipRole.Owner &&
    membership.role !== MembershipRole.Admin
  ) {
    return NextResponse.json(
      { message: "Only owners and admins can invite members" },
      { status: 403 }
    )
  }

  const workspace = await Workspace.findById(workspaceId)
  if (!workspace) {
    return NextResponse.json(
      { message: "Workspace not found" },
      { status: 404 }
    )
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

    const parsed = addMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { emails } = parsed.data

    const invited: { email: string; inviteId: string }[] = []
    const failed: { email: string; reason: InviteFailureReason }[] = []

    for (const email of emails) {
      const targetUser = await User.findOne({ email })

      // Existing Sameward accounts only (signup+invite = later)
      if (!targetUser) {
        failed.push({ email, reason: "not_found" })
        continue
      }

      const alreadyMember = await Membership.findOne({
        workspaceId,
        userId: targetUser._id,
      })
      if (alreadyMember) {
        failed.push({ email, reason: "already_member" })
        continue
      }

      try {
        // Resend-safe: drop only pending invites for this pair (keep accepted history)
        await WorkspaceInvite.deleteMany({
          workspaceId,
          email,
          acceptedAt: null,
        })

        const { rawToken, tokenHash } = createInviteToken()

        const invite = await WorkspaceInvite.create({
          workspaceId,
          email,
          invitedBy: user.id,
          tokenHash,
          expiresAt: inviteExpiresAt(),
        })

        try {
          await sendWorkspaceInviteEmail({
            to: targetUser.email,
            inviteUrl: buildInviteUrl(rawToken),
            inviteFrom: user.fullName,
            workspaceName: workspace.name,
          })
        } catch (emailErr) {
          // Don't leave a pending invite the user never received
          await WorkspaceInvite.deleteOne({ _id: invite._id })
          console.error("Invite email failed for", email, emailErr)
          failed.push({ email, reason: "email_send_failed" })
          continue
        }

        invited.push({
          email: targetUser.email,
          inviteId: invite._id.toString(),
        })

        await logWorkspaceEvent({
          event: WorkspaceAuditEvent.InviteSent,
          success: true,
          workspaceId,
          actorUserId: user.id,
          email: targetUser.email,
        })
      } catch (err: unknown) {
        console.error("Invite failed for", email, err)
        failed.push({ email, reason: "invite_failed" })
      }
    }

    return NextResponse.json({ invited, failed }, { status: 200 })
  } catch (error) {
    console.error("Failed to send invites:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/workspaces/[workspaceId]/members
 * Any member can list people in this workspace (read-only).
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

    const { workspaceId } = await params

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    const myMembership = await Membership.findOne({
      workspaceId,
      userId: user.id,
    })
    if (!myMembership) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      )
    }

    const memberships = await Membership.find({ workspaceId })

    const users = await User.find({
      _id: { $in: memberships.map((m) => m.userId) },
    }).select("fullName email avatarUrl")

    const userById = new Map(users.map((u) => [u._id.toString(), u] as const))

    const members = await Promise.all(
      memberships.map(async (m) => {
        const u = userById.get(m.userId.toString())
        const canonical =
          typeof u?.avatarUrl === "string" && u.avatarUrl.trim()
            ? u.avatarUrl.trim()
            : null
        const avatarUrl = canonical
          ? await presignAttachmentGet(canonical)
          : null

        return {
          userId: m.userId.toString(),
          fullName: u?.fullName ?? "Unknown",
          email: u?.email ?? "",
          role: m.role,
          avatarUrl,
        }
      })
    )

    return NextResponse.json({ members }, { status: 200 })
  } catch (error) {
    console.error("Failed to get members:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
