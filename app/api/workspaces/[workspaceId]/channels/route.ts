import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { createChannel } from "@/lib/channels/create-channel"
import { ensureDefaultGeneral } from "@/lib/channels/ensure-default-general"
import { unreadInfoForChannels } from "@/lib/channels/unread"
import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import channelSchema from "@/lib/schemas/channel/channel-schema"

/**
 * GET /api/workspaces/[workspaceId]/channels
 *
 * List channels this user may open:
 * - all public channels in the workspace
 * - private channels where they have ChannelMembership
 *
 * Each item includes unreadCount + lastReadAt (per-user cursor).
 * Non-members of the workspace → 404 (no existence leak).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // getCurrentUser() also connectDB()'s
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

    // Office badge — must belong to this workspace
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

    // Hybrid #general for workspaces created before channels existed
    await ensureDefaultGeneral(workspaceId, user.id)

    // Keys to locked rooms (private only)
    const privateMemberships = await ChannelMembership.find({
      workspaceId,
      userId: user.id,
    }).select("channelId")

    const privateChannelIds = privateMemberships.map((row) => row.channelId)

    const channels = await Channel.find({
      workspaceId,
      $or: [
        { visibility: ChannelVisibility.Public },
        // Private only — DM rooms are listed via GET …/dms
        {
          _id: { $in: privateChannelIds },
          visibility: ChannelVisibility.Private,
        },
      ],
    }).sort({ isDefault: -1, name: 1 })

    const unreadByChannel = await unreadInfoForChannels({
      userId: user.id,
      channelIds: channels.map((ch) => ch._id),
    })

    return NextResponse.json({
      channels: channels.map((ch) => {
        const info = unreadByChannel.get(ch._id.toString())
        return {
          id: ch._id.toString(),
          name: ch.name,
          slug: ch.slug,
          visibility: ch.visibility,
          isDefault: ch.isDefault,
          unreadCount: info?.unreadCount ?? 0,
          lastReadAt: info?.lastReadAt
            ? info.lastReadAt.toISOString()
            : null,
        }
      }),
    })
  } catch (error) {
    console.error("List channels failed:", error)
    return NextResponse.json(
      { message: "Failed to list channels" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces/[workspaceId]/channels
 *
 * Create a public or private channel. Owner | admin only.
 * Body: { name, visibility } via channelSchema.
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

    // Create permission ≠ channel access (members cannot create)
    if (
      membership.role !== MembershipRole.Owner &&
      membership.role !== MembershipRole.Admin
    ) {
      return NextResponse.json(
        { message: "Only owners and admins can create channels" },
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

    const parsed = channelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { name, visibility } = parsed.data

    const channel = await createChannel(
      workspaceId,
      name,
      visibility === "private"
        ? ChannelVisibility.Private
        : ChannelVisibility.Public,
      user.id
    )

    // Flat shape — same idea as POST /api/workspaces
    return NextResponse.json(
      {
        id: channel._id.toString(),
        name: channel.name,
        slug: channel.slug,
        visibility: channel.visibility,
        isDefault: channel.isDefault,
        unreadCount: 0,
        lastReadAt: null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create channel failed:", error)
    return NextResponse.json(
      { message: "Failed to create channel" },
      { status: 500 }
    )
  }
}
