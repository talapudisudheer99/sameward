import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { canAccessChannel } from "@/lib/channels/access"
import { resolveDmPeer } from "@/lib/channels/find-or-create-dm"
import { slugifyUniqueInWorkspace } from "@/lib/channels/channel-slugify"
import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { ChannelReadState } from "@/lib/models/channel/channel-read-state"
import { Message } from "@/lib/models/channel/message"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { renameChannelSchema } from "@/lib/schemas/channel/channel-schema"

function badIdResponse() {
  // Same message as missing — don’t leak whether the id format was wrong
  return NextResponse.json({ message: "Channel not found" }, { status: 404 })
}

/**
 * GET /api/workspaces/[workspaceId]/channels/[channelId]
 * Open one channel if allowed (public or private+membership).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params

    if (
      !workspaceId ||
      !channelId ||
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(channelId)
    ) {
      return badIdResponse()
    }

    // Office badge
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

    // Channel must live in THIS workspace (blocks cross-tenant id tricks)
    const channel = await Channel.findOne({ _id: channelId, workspaceId })
    if (!channel) {
      return badIdResponse()
    }

    // Locked room / DM? need ChannelMembership
    if (!(await canAccessChannel(user.id, channel))) {
      return badIdResponse()
    }

    let name = channel.name
    let peer: { userId: string; fullName: string } | undefined
    if (channel.visibility === ChannelVisibility.Dm) {
      const resolved = await resolveDmPeer(channelId, user.id)
      if (resolved) {
        peer = resolved
        name = resolved.fullName
      }
    }

    return NextResponse.json({
      id: channel._id.toString(),
      name,
      slug: channel.slug,
      visibility: channel.visibility,
      isDefault: channel.isDefault,
      unreadCount: 0,
      lastReadAt: null,
      ...(peer ? { peer } : {}),
    })
  } catch (error) {
    console.error("Get channel failed:", error)
    return NextResponse.json(
      { message: "Failed to get channel" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/channels/[channelId]
 * Rename channel (owner | admin). Visibility change = not in v1.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params
    if (
      !workspaceId ||
      !channelId ||
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(channelId)
    ) {
      return badIdResponse()
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

    if (
      membership.role !== MembershipRole.Owner &&
      membership.role !== MembershipRole.Admin
    ) {
      return NextResponse.json(
        { message: "Only owners and admins can rename channels" },
        { status: 403 }
      )
    }

    const channel = await Channel.findOne({ _id: channelId, workspaceId })
    if (!channel) {
      return badIdResponse()
    }

    if (channel.visibility === ChannelVisibility.Dm) {
      return NextResponse.json(
        { message: "Direct messages cannot be renamed" },
        { status: 400 }
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

    // Name only — full channelSchema would require visibility on every rename
    const parsed = renameChannelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      )
    }

    const { name } = parsed.data

    // excludeId = this channel so renaming "Hiring" doesn’t become hiring-2
    const slug = await slugifyUniqueInWorkspace(
      workspaceId,
      name,
      channel._id.toString()
    )

    const updated = await Channel.findOneAndUpdate(
      { _id: channelId, workspaceId },
      { name, slug },
      { new: true }
    )
    if (!updated) {
      return badIdResponse()
    }

    return NextResponse.json({
      id: updated._id.toString(),
      name: updated.name,
      slug: updated.slug,
      visibility: updated.visibility,
      isDefault: updated.isDefault,
      unreadCount: 0,
      lastReadAt: null,
    })
  } catch (error) {
    console.error("Rename channel failed:", error)
    return NextResponse.json(
      { message: "Failed to rename channel" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/channels/[channelId]
 * Owner | admin. Cannot delete #general (isDefault). Cascade memberships + messages.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params
    if (
      !workspaceId ||
      !channelId ||
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(channelId)
    ) {
      return badIdResponse()
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

    // PO: create/manage channels = owner | admin (same as create)
    if (
      membership.role !== MembershipRole.Owner &&
      membership.role !== MembershipRole.Admin
    ) {
      return NextResponse.json(
        { message: "Only owners and admins can delete channels" },
        { status: 403 }
      )
    }

    const channel = await Channel.findOne({ _id: channelId, workspaceId })
    if (!channel) {
      return badIdResponse()
    }

    if (channel.visibility === ChannelVisibility.Dm) {
      return NextResponse.json(
        { message: "Direct messages cannot be deleted this way" },
        { status: 400 }
      )
    }

    // Hybrid #general must stay
    if (channel.isDefault) {
      return NextResponse.json(
        { message: "Cannot delete the default channel" },
        { status: 400 }
      )
    }

    // Cascade: keys → read cursors → messages → room
    await ChannelMembership.deleteMany({ channelId })
    await ChannelReadState.deleteMany({ channelId })
    await Message.deleteMany({ channelId })
    await Channel.deleteOne({ _id: channelId, workspaceId })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete channel failed:", error)
    return NextResponse.json(
      { message: "Failed to delete channel" },
      { status: 500 }
    )
  }
}
