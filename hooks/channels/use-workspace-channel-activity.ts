"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"

import { useSocket } from "@/components/providers/socket-provider"
import type { AppDispatch } from "@/store"
import { bumpChannelUnread } from "@/store/api/channel/channel-api"

type ChannelActivityPayload = {
  channelId?: string
  authorId?: string
  createdAt?: string
}

/**
 * Listen for workspace-scoped `channel:activity` and bump unread when the
 * message is from someone else in a channel that isn’t currently open.
 * Relies on workspace:join (presence hook) so the socket is in the room.
 */
export function useWorkspaceChannelActivity(args: {
  workspaceId: string
  activeChannelId: string
  currentUserId: string
  enabled?: boolean
}): void {
  const {
    workspaceId,
    activeChannelId,
    currentUserId,
    enabled = true,
  } = args
  const { socket, status } = useSocket()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!enabled || !socket || status !== "connected") return
    if (!workspaceId || !currentUserId) return

    const onActivity = (payload: ChannelActivityPayload) => {
      const channelId = payload.channelId
      const authorId = payload.authorId
      if (!channelId || !authorId) return
      if (authorId === currentUserId) return
      if (channelId === activeChannelId) return
      bumpChannelUnread(dispatch, workspaceId, channelId)
    }

    socket.on("channel:activity", onActivity)
    return () => {
      socket.off("channel:activity", onActivity)
    }
  }, [
    socket,
    status,
    workspaceId,
    activeChannelId,
    currentUserId,
    enabled,
    dispatch,
  ])
}
