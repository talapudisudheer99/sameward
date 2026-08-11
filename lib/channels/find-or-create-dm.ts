import { Types } from "mongoose"

import { connectDB } from "@/lib/db/mongoose"
import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { Membership } from "@/lib/models/workspace/membership"
import { User } from "@/lib/models/user"

/** Stable unique key for a 1:1 pair in a workspace. */
export function dmPairKey(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join("_")
}

export type DmPeer = { userId: string; fullName: string }

export type DmChannelResult = {
  channel: InstanceType<typeof Channel>
  peer: DmPeer
}

/**
 * Find or create a 1:1 DM channel between two workspace members.
 * Ensures ChannelMembership for both users.
 */
export async function findOrCreateDm(args: {
  workspaceId: string
  userId: string
  peerUserId: string
}): Promise<
  | { ok: true; data: DmChannelResult }
  | { ok: false; status: 400 | 404; message: string }
> {
  const { workspaceId, userId, peerUserId } = args

  if (userId === peerUserId) {
    return { ok: false, status: 400, message: "Cannot DM yourself" }
  }
  if (!Types.ObjectId.isValid(peerUserId)) {
    return { ok: false, status: 400, message: "Invalid user" }
  }

  await connectDB()

  const peerMembership = await Membership.findOne({
    workspaceId,
    userId: peerUserId,
  })
  if (!peerMembership) {
    return {
      ok: false,
      status: 404,
      message: "User is not a member of this workspace",
    }
  }

  const peer = await User.findById(peerUserId).select("fullName")
  if (!peer) {
    return { ok: false, status: 404, message: "User not found" }
  }

  const pairKey = dmPairKey(userId, peerUserId)
  let channel = await Channel.findOne({
    workspaceId,
    visibility: ChannelVisibility.Dm,
    dmPairKey: pairKey,
  })

  if (!channel) {
    const slug = `dm-${pairKey}`.toLowerCase()
    try {
      channel = await Channel.create({
        workspaceId,
        name: "Direct message",
        slug,
        visibility: ChannelVisibility.Dm,
        isDefault: false,
        createdBy: userId,
        dmPairKey: pairKey,
      })

      await ChannelMembership.insertMany([
        { channelId: channel._id, workspaceId, userId },
        { channelId: channel._id, workspaceId, userId: peerUserId },
      ])
    } catch (error: unknown) {
      // Race: another request created the same pair
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        channel = await Channel.findOne({
          workspaceId,
          visibility: ChannelVisibility.Dm,
          dmPairKey: pairKey,
        })
        if (!channel) throw error
      } else {
        throw error
      }
    }
  }

  // Ensure both memberships exist (repair if create raced / partial)
  await ChannelMembership.updateOne(
    { channelId: channel._id, userId },
    { $setOnInsert: { workspaceId, channelId: channel._id, userId } },
    { upsert: true }
  )
  await ChannelMembership.updateOne(
    { channelId: channel._id, userId: peerUserId },
    {
      $setOnInsert: {
        workspaceId,
        channelId: channel._id,
        userId: peerUserId,
      },
    },
    { upsert: true }
  )

  return {
    ok: true,
    data: {
      channel,
      peer: { userId: peerUserId, fullName: peer.fullName },
    },
  }
}

/**
 * Resolve the other participant in a DM for the current viewer.
 */
export async function resolveDmPeer(
  channelId: string,
  viewerUserId: string
): Promise<DmPeer | null> {
  const memberships = await ChannelMembership.find({ channelId }).select(
    "userId"
  )
  const peerId = memberships
    .map((m) => m.userId.toString())
    .find((id) => id !== viewerUserId)
  if (!peerId) return null
  const peer = await User.findById(peerId).select("fullName")
  if (!peer) return null
  return { userId: peerId, fullName: peer.fullName }
}
