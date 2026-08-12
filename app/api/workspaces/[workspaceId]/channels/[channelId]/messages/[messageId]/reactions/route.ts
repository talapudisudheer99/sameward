import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import { toMessageJson } from "@/lib/channels/message-json"
import { notifyRealtime } from "@/lib/channels/notify-realtime"
import { channelRoomName } from "@/lib/channels/channel-room"
import { Message } from "@/lib/models/channel/message"
import { User } from "@/lib/models/user"
import messageReactionSchema from "@/lib/schemas/channel/message-reaction-schema"

type RouteParams = {
  params: Promise<{
    workspaceId: string
    channelId: string
    messageId: string
  }>
}

/**
 * POST /api/workspaces/.../messages/[messageId]/reactions
 * Toggle a reaction for the current user (add if missing, remove if present).
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId, messageId } = await params
    if (!Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    const access = await requireChannelAccess(workspaceId, channelId, user.id)
    if (!access.ok) return access.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsed = messageReactionSchema.safeParse(
      typeof body === "object" && body !== null ? body : {}
    )
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { emoji } = parsed.data
    const msg = await Message.findOne({ _id: messageId, channelId })
    if (!msg || msg.deletedAt) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    const userOid = new Types.ObjectId(user.id)
    // Work with plain objects — DocumentArray subdocs aren't assignable to { emoji, userIds }
    const reactions: { emoji: string; userIds: Types.ObjectId[] }[] = (
      msg.reactions ?? []
    ).map((r) => ({
      emoji: r.emoji,
      userIds: [...(r.userIds ?? [])],
    }))
    const idx = reactions.findIndex((r) => r.emoji === emoji)

    if (idx >= 0) {
      const entry = reactions[idx]!
      const ids = entry.userIds.map((id) => id.toString())
      if (ids.includes(user.id)) {
        // Remove this user's reaction
        const nextIds = entry.userIds.filter((id) => id.toString() !== user.id)
        if (nextIds.length === 0) {
          reactions.splice(idx, 1)
        } else {
          reactions[idx] = { emoji: entry.emoji, userIds: nextIds }
        }
      } else {
        // Add user to existing emoji
        reactions[idx] = {
          emoji: entry.emoji,
          userIds: [...entry.userIds, userOid],
        }
      }
    } else {
      if (reactions.length >= 20) {
        return NextResponse.json(
          { message: "Too many reaction types on this message" },
          { status: 400 }
        )
      }
      reactions.push({ emoji, userIds: [userOid] })
    }

    msg.set("reactions", reactions)
    await msg.save()

    const author = await User.findById(msg.authorId).select("fullName")
    const json = await toMessageJson(
      msg,
      author?.fullName ?? "Unknown"
    )

    await notifyRealtime({
      room: channelRoomName(channelId),
      event: "message:update",
      payload: json,
    })

    return NextResponse.json(json, { status: 200 })
  } catch (error) {
    console.error("Toggle reaction failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
