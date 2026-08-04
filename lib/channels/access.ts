import { NextResponse } from "next/server"
import { Types } from "mongoose"

import {
  Channel,
  ChannelVisibility,
  type ChannelDocument,
} from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { Membership } from "@/lib/models/workspace/membership"

/**
 * Can this user open this channel?
 *
 * Caller must already have verified workspace membership + loaded the channel.
 * - Public → true (office badge is enough)
 * - Private → need a ChannelMembership row (key to the locked room)
 */
export async function canAccessChannel(
  userId: string,
  channel: ChannelDocument
): Promise<boolean> {
  if (channel.visibility === ChannelVisibility.Public) {
    return true
  }

  const exists = await ChannelMembership.exists({
    channelId: channel._id,
    userId,
  })

  // exists() → document or null
  return exists != null
}

export type ChannelAccessGate =
  | { ok: true; channel: ChannelDocument }
  | { ok: false; response: NextResponse }

/**
 * HTTP gate for routes that need “allowed in this channel” (messages, get channel, …).
 *
 * Validates ids → workspace Membership → Channel in workspace → `canAccessChannel`.
 * Non-access → **404** (same message; don’t leak existence).
 *
 * Prefer this in handlers; keep calling `canAccessChannel` only when you already
 * have membership + channel loaded (e.g. mid-handler checks).
 */
export async function requireChannelAccess(
  workspaceId: string,
  channelId: string,
  userId: string
): Promise<ChannelAccessGate> {
  if (
    !workspaceId ||
    !channelId ||
    !Types.ObjectId.isValid(workspaceId) ||
    !Types.ObjectId.isValid(channelId)
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      ),
    }
  }

  const membership = await Membership.findOne({ workspaceId, userId })
  if (!membership) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      ),
    }
  }

  const channel = await Channel.findOne({ _id: channelId, workspaceId })
  if (!channel) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      ),
    }
  }

  if (!(await canAccessChannel(userId, channel))) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      ),
    }
  }

  return { ok: true, channel }
}
