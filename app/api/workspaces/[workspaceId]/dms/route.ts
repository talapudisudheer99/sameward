import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import {
  findOrCreateDm,
  resolveDmPeer,
} from "@/lib/channels/find-or-create-dm"
import { unreadInfoForChannels } from "@/lib/channels/unread"
import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { Membership } from "@/lib/models/workspace/membership"
import { openDmSchema } from "@/lib/schemas/channel/dm-schema"

/**
 * GET /api/workspaces/[workspaceId]/dms
 * List 1:1 DM rooms the caller belongs to (peer + unread).
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

    const myMemberships = await ChannelMembership.find({
      workspaceId,
      userId: user.id,
    }).select("channelId")

    const channelIds = myMemberships.map((m) => m.channelId)
    if (channelIds.length === 0) {
      return NextResponse.json({ dms: [] })
    }

    const dmChannels = await Channel.find({
      _id: { $in: channelIds },
      workspaceId,
      visibility: ChannelVisibility.Dm,
    }).sort({ updatedAt: -1 })

    const unreadByChannel = await unreadInfoForChannels({
      userId: user.id,
      channelIds: dmChannels.map((ch) => ch._id),
    })

    const dms = await Promise.all(
      dmChannels.map(async (ch) => {
        const peer = await resolveDmPeer(ch._id.toString(), user.id)
        const info = unreadByChannel.get(ch._id.toString())
        return {
          id: ch._id.toString(),
          peer: peer ?? {
            userId: "",
            fullName: "Unknown",
          },
          unreadCount: info?.unreadCount ?? 0,
          lastReadAt: info?.lastReadAt
            ? info.lastReadAt.toISOString()
            : null,
        }
      })
    )

    return NextResponse.json({ dms })
  } catch (error) {
    console.error("List DMs failed:", error)
    return NextResponse.json(
      { message: "Failed to list direct messages" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces/[workspaceId]/dms
 * Body: { userId } — find or create 1:1 DM with that workspace member.
 */
export async function POST(
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsed = openDmSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const result = await findOrCreateDm({
      workspaceId,
      userId: user.id,
      peerUserId: parsed.data.userId,
    })

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      )
    }

    const { channel, peer } = result.data
    const unread = await unreadInfoForChannels({
      userId: user.id,
      channelIds: [channel._id],
    })
    const info = unread.get(channel._id.toString())

    return NextResponse.json(
      {
        id: channel._id.toString(),
        peer,
        unreadCount: info?.unreadCount ?? 0,
        lastReadAt: info?.lastReadAt ? info.lastReadAt.toISOString() : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Open DM failed:", error)
    return NextResponse.json(
      { message: "Failed to open direct message" },
      { status: 500 }
    )
  }
}
