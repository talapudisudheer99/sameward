import type { Socket } from "socket.io"

import { connectDB } from "@/lib/db/mongoose"
import { resolveChannelAccess } from "@/lib/channels/access"
import { channelRoomName } from "@/lib/channels/channel-room"
import { emitTypingStop } from "./typing-handlers"

export { channelRoomName }

type JoinPayload = { channelId?: string }

/**
 * After handshake auth: join/leave channel rooms with the same access rules as REST.
 */
export function registerRoomHandlers(socket: Socket): void {
  socket.on("channel:join", async (payload: JoinPayload = {}) => {
    const userId = socket.data.userId as string | undefined
    const channelId = payload.channelId

    if (!userId) {
      socket.emit("channel:error", {
        code: "unauthorized",
        message: "Not authenticated",
      })
      return
    }

    if (!channelId || typeof channelId !== "string") {
      socket.emit("channel:error", {
        code: "bad_request",
        message: "channelId required",
      })
      return
    }

    try {
      await connectDB()
      const access = await resolveChannelAccess(userId, channelId)

      if (!access.ok) {
        socket.emit("channel:error", {
          code: "join_denied",
          channelId,
          reason: access.reason,
        })
        console.log(
          `[realtime] join denied socket=${socket.id} user=${userId} channel=${channelId} reason=${access.reason}`
        )
        return
      }

      await socket.join(channelRoomName(channelId))
      socket.emit("channel:joined", { channelId })
      console.log(
        `[realtime] joined room=${channelRoomName(channelId)} socket=${socket.id} user=${userId}`
      )
    } catch (err) {
      console.error("[realtime] channel:join error:", err)
      socket.emit("channel:error", {
        code: "server_error",
        channelId,
        message: "Join failed",
      })
    }
  })

  socket.on("channel:leave", async (payload: JoinPayload = {}) => {
    const channelId = payload.channelId
    if (!channelId || typeof channelId !== "string") return

    // Clear typing before leave so peers drop the indicator immediately.
    emitTypingStop(socket, channelId)

    await socket.leave(channelRoomName(channelId))
    socket.emit("channel:left", { channelId })
    console.log(
      `[realtime] left room=${channelRoomName(channelId)} socket=${socket.id}`
    )
  })
}
