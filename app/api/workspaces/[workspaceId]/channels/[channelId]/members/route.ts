import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { canAccessChannel } from "@/lib/channels/access"
import { requirePrivateChannelMembersGate } from "@/lib/channels/require-private-channel-gate"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { User } from "@/lib/models/user"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import channelMembersSchema from "@/lib/schemas/channel/channel-members-schema"

type AddChannelMembersFailureReason =
  "not_workspace_member" | "already_member" | "invalid_id"

/**
 * GET …/channels/[channelId]/members
 * List who has a key to this private channel.
 * Caller must canAccessChannel (else 404 — no leak).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const { workspaceId, channelId } = await params

    const gate = await requirePrivateChannelMembersGate(workspaceId, channelId)
    if (!gate.ok) {
      return gate.response
    }

    const { user, channel } = gate

    // Locked room: must have a key to see the member list
    if (!(await canAccessChannel(user.id, channel))) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      )
    }

    const channelMembers = await ChannelMembership.find({
      workspaceId,
      channelId,
    })

    // Keep membership order — User.find($in) does not guarantee order
    const userIds = channelMembers.map((member) => member.userId.toString())

    const users = await User.find({
      _id: { $in: userIds },
    }).select("fullName email")

    const usersById = new Map(users.map((u) => [u._id.toString(), u] as const))

    const members = userIds.flatMap((id) => {
      const u = usersById.get(id)
      if (!u) return []
      return [
        {
          userId: id,
          fullName: u.fullName,
          email: u.email,
        },
      ]
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Get channel members failed:", error)
    return NextResponse.json(
      { message: "Failed to list channel members" },
      { status: 500 }
    )
  }
}

/**
 * POST …/channels/[channelId]/members
 * Owner | admin hands out keys. Targets must already be workspace members.
 * Body: { userIds: string[] } → { added, failed }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const { workspaceId, channelId } = await params

    const gate = await requirePrivateChannelMembersGate(workspaceId, channelId)
    if (!gate.ok) {
      return gate.response
    }

    const { membership } = gate

    if (
      membership.role !== MembershipRole.Owner &&
      membership.role !== MembershipRole.Admin
    ) {
      return NextResponse.json(
        { message: "Only owners and admins can add channel members" },
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

    const parsed = channelMembersSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { userIds } = parsed.data

    const added: { userId: string }[] = []
    const failed: { userId: string; reason: AddChannelMembersFailureReason }[] =
      []

    // Workspace member first, then channel key (never invent access)
    for (const userId of userIds) {
      if (!Types.ObjectId.isValid(userId)) {
        failed.push({ userId, reason: "invalid_id" })
        continue
      }

      const workspaceMembership = await Membership.findOne({
        workspaceId,
        userId,
      })
      if (!workspaceMembership) {
        failed.push({ userId, reason: "not_workspace_member" })
        continue
      }

      const existing = await ChannelMembership.findOne({
        channelId,
        userId,
      })
      if (existing) {
        failed.push({ userId, reason: "already_member" })
        continue
      }

      await ChannelMembership.create({
        channelId,
        workspaceId,
        userId,
      })
      added.push({ userId })
    }

    return NextResponse.json({ added, failed })
  } catch (error) {
    console.error("Add channel members failed:", error)
    return NextResponse.json(
      { message: "Failed to add channel members" },
      { status: 500 }
    )
  }
}
