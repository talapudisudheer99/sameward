import { NextResponse } from "next/server"
import { Types } from "mongoose"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import { toMessageJson } from "@/lib/channels/message-json"
import { notifyRealtime } from "@/lib/channels/notify-realtime"
import { channelRoomName } from "@/lib/channels/channel-room"
import {
  resolveLinkPreviewsWithBudget,
} from "@/lib/channels/og-preview"
import { finalizeLinkPreviewsInBackground } from "@/lib/channels/finalize-link-previews"
import { Message } from "@/lib/models/channel/message"
import {
  Membership,
  MembershipRole,
} from "@/lib/models/workspace/membership"
import { User } from "@/lib/models/user"
import messageEditSchema from "@/lib/schemas/channel/message-edit-schema"
import { deleteMessageAttachments } from "@/lib/storage/s3"

type RouteParams = {
  params: Promise<{
    workspaceId: string
    channelId: string
    messageId: string
  }>
}

async function authorNameFor(authorId: string, fallback: string) {
  const author = await User.findById(authorId).select("fullName")
  return author?.fullName ?? fallback
}

/**
 * PATCH /api/workspaces/.../messages/[messageId]
 * Edit body — author only. Soft-deleted messages cannot be edited.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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

    const parsed = messageEditSchema.safeParse(
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

    const msg = await Message.findOne({ _id: messageId, channelId })
    if (!msg || msg.deletedAt) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    if (msg.authorId.toString() !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    msg.body = parsed.data.body
    msg.editedAt = new Date()

    const { previews, pending } = await resolveLinkPreviewsWithBudget(
      parsed.data.body
    )
    msg.set("linkPreviews", previews)
    await msg.save()

    const json = await toMessageJson(msg, user.fullName)

    await notifyRealtime({
      room: channelRoomName(channelId),
      event: "message:update",
      payload: json,
    })

    if (pending) {
      finalizeLinkPreviewsInBackground({
        messageId: msg._id,
        channelId,
        authorDisplayName: user.fullName,
        pending,
        logLabel: "edit",
      })
    }

    return NextResponse.json(json, { status: 200 })
  } catch (error) {
    console.error("Patch message failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/workspaces/.../messages/[messageId]
 * Soft delete — author | owner | admin. Idempotent if already deleted.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
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

    const msg = await Message.findOne({ _id: messageId, channelId })
    if (!msg) {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }

    const name = await authorNameFor(msg.authorId.toString(), "Unknown")

    // Idempotent — already a tombstone
    if (msg.deletedAt) {
      return NextResponse.json(await toMessageJson(msg, name), { status: 200 })
    }

    const isAuthor = msg.authorId.toString() === user.id
    if (!isAuthor) {
      const membership = await Membership.findOne({
        workspaceId,
        userId: user.id,
      }).select("role")
      const isMod =
        membership?.role === MembershipRole.Owner ||
        membership?.role === MembershipRole.Admin
      if (!isMod) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 })
      }
    }

    const attachmentSnapshot = [...(msg.attachments ?? [])].map((a) => ({
      url: a.url,
    }))

    msg.deletedAt = new Date()
    msg.deletedBy = new Types.ObjectId(user.id)
    msg.body = ""
    msg.set("attachments", [])
    msg.set("mentionedUserIds", [])
    msg.set("linkPreviews", [])
    await msg.save()

    const json = await toMessageJson(msg, name)

    await notifyRealtime({
      room: channelRoomName(channelId),
      event: "message:delete",
      payload: json,
    })

    // Best-effort S3 cleanup — never fail the HTTP response
    void deleteMessageAttachments(attachmentSnapshot)

    return NextResponse.json(json, { status: 200 })
  } catch (error) {
    console.error("Delete message failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
