import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import { notifyRealtime } from "@/lib/channels/notify-realtime"
import { channelRoomName } from "@/lib/channels/channel-room"
import { Message } from "@/lib/models/channel/message"
import { User } from "@/lib/models/user"
import messageSchema from "@/lib/schemas/channel/message-schema"

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

type ChatMessageJson = {
  id: string
  channelId: string
  authorId: string
  authorName: string
  body: string
  attachments: {
    url: string
    name: string
    mime: string
    sizeBytes: number
  }[]
  createdAt: string
}

/** Same JSON shape for GET history items and POST create/idempotent responses */
function toMessageJson(
  doc: {
    _id: { toString(): string }
    channelId: { toString(): string }
    authorId: { toString(): string }
    body: string
    attachments?: {
      url: string
      name: string
      mime: string
      sizeBytes: number
    }[]
    createdAt: Date
  },
  authorName: string
): ChatMessageJson {
  return {
    id: doc._id.toString(),
    channelId: doc.channelId.toString(),
    authorId: doc.authorId.toString(),
    authorName,
    body: doc.body,
    attachments: (doc.attachments ?? []).map((a) => ({
      url: a.url,
      name: a.name,
      mime: a.mime,
      sizeBytes: a.sizeBytes,
    })),
    createdAt: doc.createdAt.toISOString(),
  }
}

/**
 * GET /api/workspaces/[workspaceId]/channels/[channelId]/messages
 *
 * Cursor pagination (newest page first, then older):
 * - No cursor → newest `limit` messages
 * - ?cursor=<ISO createdAt> → messages older than that time
 * - Fetch limit+1 so nextCursor is null when no older page exists
 * - Response `messages` are oldest → newest (transcript order)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params
    const access = await requireChannelAccess(workspaceId, channelId, user.id)
    if (!access.ok) return access.response

    const { searchParams } = new URL(request.url)

    const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT)
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
      : DEFAULT_LIMIT

    const cursor = searchParams.get("cursor")
    let cursorDate: Date | null = null
    if (cursor) {
      cursorDate = new Date(cursor)
      if (Number.isNaN(cursorDate.getTime())) {
        return NextResponse.json({ message: "Invalid cursor" }, { status: 400 })
      }
    }

    const filter: {
      channelId: string
      createdAt?: { $lt: Date }
    } = { channelId }

    if (cursorDate) {
      filter.createdAt = { $lt: cursorDate }
    }

    // Newest first (index: channelId + createdAt desc). +1 to detect “has older”.
    const rows = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean()

    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows

    // Bookmark = oldest in this page (last after desc sort)
    const nextCursor =
      hasMore && page.length > 0
        ? page[page.length - 1]!.createdAt.toISOString()
        : null

    // Transcript order for the UI
    const chronological = [...page].reverse()

    const authorIds = [
      ...new Set(chronological.map((m) => m.authorId.toString())),
    ]
    const authors = await User.find({ _id: { $in: authorIds } }).select(
      "fullName"
    )
    const nameById = new Map(
      authors.map((a) => [a._id.toString(), a.fullName] as const)
    )

    const messages = chronological.map((m) =>
      toMessageJson(m, nameById.get(m.authorId.toString()) ?? "Unknown")
    )

    return NextResponse.json({ messages, nextCursor }, { status: 200 })
  } catch (error) {
    console.error("Get messages failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/workspaces/[workspaceId]/channels/[channelId]/messages
 * Create a text message (T11). Attachments forced empty until S3.
 * Optional clientMessageId → idempotent (retry returns same row, 200).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params
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

    // T11 text-only: wipe client attachments so Zod requires a non-empty body
    const parsed = messageSchema.safeParse({
      ...(typeof body === "object" && body !== null ? body : {}),
      attachments: [],
    })
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { body: text, clientMessageId } = parsed.data

    // Fast path: client retried with the same clientMessageId
    if (clientMessageId) {
      const existing = await Message.findOne({ channelId, clientMessageId })
      if (existing) {
        return NextResponse.json(toMessageJson(existing, user.fullName), {
          status: 200,
        })
      }
    }

    try {
      const message = await Message.create({
        workspaceId,
        channelId,
        authorId: user.id,
        body: text,
        attachments: [],
        ...(clientMessageId ? { clientMessageId } : {}),
      })

      const json = toMessageJson(message, user.fullName)

      // Fan-out after write — best-effort; Mongo row already exists
      await notifyRealtime({
        room: channelRoomName(channelId),
        event: "message:new",
        payload: json,
      })

      return NextResponse.json(json, {
        status: 201,
      })
    } catch (error: unknown) {
      // Race: two parallel creates with same clientMessageId
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000 &&
        clientMessageId
      ) {
        const existing = await Message.findOne({ channelId, clientMessageId })
        if (existing) {
          return NextResponse.json(toMessageJson(existing, user.fullName), {
            status: 200,
          })
        }
      }

      throw error
    }
  } catch (error) {
    console.error("Post message failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
