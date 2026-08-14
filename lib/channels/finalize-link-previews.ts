import type { Types } from "mongoose"

import { channelRoomName } from "@/lib/channels/channel-room"
import { toMessageJson } from "@/lib/channels/message-json"
import type { LinkPreview } from "@/lib/types/channel/link-preview"
import { notifyRealtime } from "@/lib/channels/notify-realtime"
import { Message } from "@/lib/models/channel/message"

/**
 * When OG resolve exceeds the send budget, finish in background and
 * fan-out `message:update` so clients attach cards without a refetch.
 */
export function finalizeLinkPreviewsInBackground(opts: {
  messageId: Types.ObjectId | string
  channelId: string
  authorDisplayName: string
  pending: Promise<LinkPreview[]>
  /** Log label — e.g. create vs edit */
  logLabel?: string
}): void {
  const {
    messageId,
    channelId,
    authorDisplayName,
    pending,
    logLabel = "background",
  } = opts

  void pending
    .then(async (latePreviews) => {
      if (latePreviews.length === 0) return
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { $set: { linkPreviews: latePreviews } },
        { new: true }
      )
      if (!updated || updated.deletedAt) return
      const payload = await toMessageJson(updated, authorDisplayName)
      await notifyRealtime({
        room: channelRoomName(channelId),
        event: "message:update",
        payload,
      })
    })
    .catch((err) => console.error(`[og-preview] ${logLabel}`, err))
}
