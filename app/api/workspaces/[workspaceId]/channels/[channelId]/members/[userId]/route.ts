import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { requirePrivateChannelMembersGate } from "@/lib/channels/require-private-channel-gate"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { MembershipRole } from "@/lib/models/workspace/membership"

/**
 * DELETE …/channels/[channelId]/members/[userId]
 * Owner | admin takes back one key.
 * Block removing the last member (empty locked room).
 */
export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string
      channelId: string
      userId: string
    }>
  }
) {
  try {
    const { workspaceId, channelId, userId } = await params

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      )
    }

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
        { message: "Only owners and admins can remove channel members" },
        { status: 403 }
      )
    }

    const targetMembership = await ChannelMembership.findOne({
      channelId,
      workspaceId,
      userId,
    })
    if (!targetMembership) {
      return NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      )
    }

    const memberCount = await ChannelMembership.countDocuments({
      channelId,
      workspaceId,
    })
    if (memberCount <= 1) {
      return NextResponse.json(
        { message: "Cannot remove the last member" },
        { status: 400 }
      )
    }

    await ChannelMembership.deleteOne({
      channelId,
      workspaceId,
      userId,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Remove channel member failed:", error)
    return NextResponse.json(
      { message: "Failed to remove channel member" },
      { status: 500 }
    )
  }
}
