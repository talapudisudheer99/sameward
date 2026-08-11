import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import { ChannelReadState } from "@/lib/models/channel/channel-read-state"

/**
 * POST /api/workspaces/[workspaceId]/channels/[channelId]/read
 *
 * Upsert this user’s read cursor to now. Returns the previous cursor so the
 * client can still run Catch up “Since last visit” after the room is marked read.
 */
export async function POST(
  _request: Request,
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

    const now = new Date()

    const existing = await ChannelReadState.findOne({
      channelId,
      userId: user.id,
    }).select("lastReadAt")

    const previousLastReadAt = existing?.lastReadAt
      ? existing.lastReadAt.toISOString()
      : null

    await ChannelReadState.findOneAndUpdate(
      { channelId, userId: user.id },
      {
        $set: { lastReadAt: now, workspaceId },
        $setOnInsert: { channelId, userId: user.id },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      channelId,
      lastReadAt: now.toISOString(),
      previousLastReadAt,
    })
  } catch (error) {
    console.error("Mark channel read failed:", error)
    return NextResponse.json(
      { message: "Failed to mark channel as read" },
      { status: 500 }
    )
  }
}
