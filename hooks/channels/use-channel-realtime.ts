"use client"

import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"

import { useSocket } from "@/components/providers/socket-provider"
import type { ChatMessage } from "@/lib/types/channel/channel-types"
import type { AppDispatch } from "@/store"
import { channelsApi } from "@/store/api/channel/channel-api"

/** Must match the getMessages args used on the chat page. */
const MESSAGE_PAGE_LIMIT = 50

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false
  const m = value as Record<string, unknown>
  return (
    typeof m.id === "string" &&
    typeof m.channelId === "string" &&
    typeof m.body === "string" &&
    typeof m.createdAt === "string"
  )
}

function appendMessageToCache(
  dispatch: AppDispatch,
  workspaceId: string,
  channelId: string,
  message: ChatMessage
): void {
  dispatch(
    channelsApi.util.updateQueryData(
      "getMessages",
      { workspaceId, channelId, limit: MESSAGE_PAGE_LIMIT },
      (draft) => {
        if (draft.messages.some((m) => m.id === message.id)) return
        draft.messages.push(message)
      }
    )
  )
}

/**
 * Join the open channel room, append message:new into RTK, gap-fetch on reconnect.
 */
export function useChannelRealtime(args: {
  workspaceId: string
  channelId: string
  enabled?: boolean
}): { reconnecting: boolean } {
  const { workspaceId, channelId, enabled = true } = args
  const { socket, status, reconnecting } = useSocket()
  const dispatch = useDispatch<AppDispatch>()
  const hadConnectedRef = useRef(false)
  const prevStatusRef = useRef(status)

  // Gap fill only when we regain a connection (not on channel switch)
  useEffect(() => {
    const wasDisconnected = prevStatusRef.current !== "connected"
    prevStatusRef.current = status

    if (!enabled || !channelId || !workspaceId) return
    if (status !== "connected") return

    if (wasDisconnected && hadConnectedRef.current) {
      dispatch(
        channelsApi.util.invalidateTags([{ type: "Message", id: channelId }])
      )
    }
    hadConnectedRef.current = true
  }, [status, channelId, workspaceId, enabled, dispatch]) //Which outside variables am I reading?

  // Join / leave + live append

  useEffect(() => {
    if (!enabled || !socket || !channelId || status !== "connected") return

    socket.emit("channel:join", { channelId })

    const onMessageNew = (payload: unknown) => {
      if (!isChatMessage(payload)) return
      if (payload.channelId !== channelId) return
      appendMessageToCache(dispatch, workspaceId, channelId, payload)
    }

    const onChannelError = (payload: {
      code?: string
      reasong?: string
      message?: string
    }) => {
      console.error("[socket] channel:error", payload)
    }

    socket.on("message:new", onMessageNew)
    socket.on("channel:error", onChannelError)

    return () => {
      socket.emit("channel:leave", { channelId })
      socket.off("message:new", onMessageNew)
      socket.off("channel:error", onChannelError)
    }
  }, [socket, channelId, workspaceId, status, enabled, dispatch])

  return { reconnecting: enabled && reconnecting }
}

export { MESSAGE_PAGE_LIMIT }
