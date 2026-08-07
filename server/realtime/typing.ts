import type { Socket } from "socket.io"

import { channelRoomName } from "@/lib/channels/channel-room"

type TypingPayload = {
  channelId?: string
}

type TypingEvent = "typing:start" | "typing:stop"

const CHANNEL_ROOM_PREFIX = "channel:"

/**
 * Shared guards for typing:start / typing:stop.
 * Identity always comes from socket.data (T14 auth) — never from the client payload.
 */
function parseTypingContext(
  socket: Socket,
  payload: TypingPayload
):
  | {
      ok: true
      channelId: string
      userId: string
      fullName: string
    }
  | { ok: false } {
  const userId = socket.data.userId as string | undefined
  const fullName = (socket.data.fullName as string | undefined) ?? "Someone"
  const channelId = payload.channelId

  if (!userId) {
    socket.emit("typing:error", {
      code: "unauthorized",
      message: "Not authenticated",
    })
    return { ok: false }
  }

  if (!channelId || typeof channelId !== "string") {
    socket.emit("typing:error", {
      code: "bad_request",
      message: "channelId required",
    })
    return { ok: false }
  }

  // Join already ran access checks — typing only needs "already in this room"
  const room = channelRoomName(channelId)
  if (!socket.rooms.has(room)) {
    socket.emit("typing:error", {
      code: "not_in_channel",
      channelId,
      message: "You are not in this channel",
    })
    console.log(
      `[realtime] typing not in channel socket=${socket.id} user=${userId} channel=${channelId}`
    )
    return { ok: false }
  }

  return { ok: true, channelId, userId, fullName }
}

/** Relay to everyone else in the room (no echo to sender). */
function broadcastTyping(
  socket: Socket,
  event: TypingEvent,
  channelId: string,
  userId: string,
  fullName: string
): void {
  socket.to(channelRoomName(channelId)).emit(event, {
    channelId,
    userId,
    fullName,
  })
}

/**
 * Best-effort clear — used on channel:leave / disconnecting.
 * Skips auth errors; peers also expire typing UI on a client timeout.
 */
export function emitTypingStop(socket: Socket, channelId: string): void {
  const userId = socket.data.userId as string | undefined
  if (!userId || !channelId) return

  const fullName = (socket.data.fullName as string | undefined) ?? "Someone"
  broadcastTyping(socket, "typing:stop", channelId, userId, fullName)
}

/** While still in rooms (disconnecting), stop typing in every channel room. */
function clearTypingOnDisconnecting(socket: Socket): void {
  const userId = socket.data.userId as string | undefined
  if (!userId) return

  const fullName = (socket.data.fullName as string | undefined) ?? "Someone"

  for (const room of socket.rooms) {
    if (!room.startsWith(CHANNEL_ROOM_PREFIX)) continue
    const channelId = room.slice(CHANNEL_ROOM_PREFIX.length)
    if (!channelId) continue
    broadcastTyping(socket, "typing:stop", channelId, userId, fullName)
  }
}

/**
 * T17 — typing relay only. Does not build "X is typing…" (React does).
 * Call from connection setup next to registerRoomHandlers.
 */
export function registerTypingHandlers(socket: Socket): void {
  socket.on("typing:start", (payload: TypingPayload = {}) => {
    const ctx = parseTypingContext(socket, payload)
    if (!ctx.ok) return

    broadcastTyping(
      socket,
      "typing:start",
      ctx.channelId,
      ctx.userId,
      ctx.fullName
    )
  })

  socket.on("typing:stop", (payload: TypingPayload = {}) => {
    const ctx = parseTypingContext(socket, payload)
    if (!ctx.ok) return

    broadcastTyping(
      socket,
      "typing:stop",
      ctx.channelId,
      ctx.userId,
      ctx.fullName
    )
  })

  // Prefer disconnecting over disconnect — rooms are still listed here.
  socket.on("disconnecting", () => {
    clearTypingOnDisconnecting(socket)
  })
}
