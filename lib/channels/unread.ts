import { Types } from "mongoose"

import { ChannelReadState } from "@/lib/models/channel/channel-read-state"
import { Message } from "@/lib/models/channel/message"

export type ChannelUnreadInfo = {
  unreadCount: number
  lastReadAt: Date | null
}

/**
 * Batch unread counts for a user across many channels.
 * Never-opened channels: all others’ messages count as unread.
 */
export async function unreadInfoForChannels(args: {
  userId: string
  channelIds: Types.ObjectId[]
}): Promise<Map<string, ChannelUnreadInfo>> {
  const { userId, channelIds } = args
  const result = new Map<string, ChannelUnreadInfo>()

  for (const id of channelIds) {
    result.set(id.toString(), { unreadCount: 0, lastReadAt: null })
  }

  if (channelIds.length === 0) return result

  if (!Types.ObjectId.isValid(userId)) return result
  const userOid = new Types.ObjectId(userId)

  const states = await ChannelReadState.find({
    userId: userOid,
    channelId: { $in: channelIds },
  })
    .select("channelId lastReadAt")
    .lean()

  const withState: { channelId: Types.ObjectId; lastReadAt: Date }[] = []
  const withoutState: Types.ObjectId[] = []

  const stateByChannel = new Map(
    states.map((s) => [s.channelId.toString(), s.lastReadAt as Date])
  )

  for (const id of channelIds) {
    const key = id.toString()
    const lastReadAt = stateByChannel.get(key) ?? null
    result.set(key, { unreadCount: 0, lastReadAt })
    if (lastReadAt) {
      withState.push({ channelId: id, lastReadAt })
    } else {
      withoutState.push(id)
    }
  }

  if (withoutState.length > 0) {
    const rows = await Message.aggregate<{ _id: Types.ObjectId; count: number }>(
      [
        {
          $match: {
            channelId: { $in: withoutState },
            authorId: { $ne: userOid },
            deletedAt: null,
          },
        },
        { $group: { _id: "$channelId", count: { $sum: 1 } } },
      ]
    )
    for (const row of rows) {
      const key = row._id.toString()
      const prev = result.get(key)
      if (prev) result.set(key, { ...prev, unreadCount: row.count })
    }
  }

  if (withState.length > 0) {
    const rows = await Message.aggregate<{ _id: Types.ObjectId; count: number }>(
      [
        {
          $match: {
            authorId: { $ne: userOid },
            deletedAt: null,
            $or: withState.map(({ channelId, lastReadAt }) => ({
              channelId,
              createdAt: { $gt: lastReadAt },
            })),
          },
        },
        { $group: { _id: "$channelId", count: { $sum: 1 } } },
      ]
    )
    for (const row of rows) {
      const key = row._id.toString()
      const prev = result.get(key)
      if (prev) result.set(key, { ...prev, unreadCount: row.count })
    }
  }

  return result
}
