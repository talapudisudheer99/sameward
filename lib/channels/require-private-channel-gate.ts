import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import {
  Channel,
  ChannelVisibility,
  type ChannelDocument,
} from "@/lib/models/channel/channel"
import {
  Membership,
  type MembershipDocument,
} from "@/lib/models/workspace/membership"

/** Safe user fields from getCurrentUser() */
export type AuthUser = {
  id: string
  fullName: string
  email: string
  emailVerified: boolean
}

export type PrivateChannelMembersGate =
  | {
      ok: true
      user: AuthUser
      membership: MembershipDocument
      channel: ChannelDocument
    }
  | { ok: false; response: NextResponse }

/**
 * Shared gate for private-channel member APIs (GET/POST/DELETE).
 * Auth → ids → workspace membership → channel in workspace → must be private.
 *
 * Lives in lib/ (not route.ts) so nested routes can import without
 * pulling the App Router route module.
 */
export async function requirePrivateChannelMembersGate(
  workspaceId: string,
  channelId: string
): Promise<PrivateChannelMembersGate> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    }
  }

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

  // Office badge
  const membership = await Membership.findOne({
    workspaceId,
    userId: user.id,
  })
  if (!membership) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      ),
    }
  }

  const channel = await Channel.findOne({
    _id: channelId,
    workspaceId,
  })
  if (!channel) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Channel not found" },
        { status: 404 }
      ),
    }
  }

  // Public channels have no ChannelMembership list
  if (channel.visibility !== ChannelVisibility.Private) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Only private channels have members" },
        { status: 400 }
      ),
    }
  }

  return { ok: true, user, membership, channel }
}
