"use client"

import { useEffect, useState } from "react"

import { useSocket } from "@/components/providers/socket-provider"
import { formatTypingLabel } from "@/lib/channels/format-typing-label"

const TYPING_TTL_MS = 3000

type TypingEntry = {
  fullName: string
  expiresAt: number
  channelId: string
}

type Payload = {
  channelId?: string
  userId?: string
  fullName?: string
}

/**
 * Listen for typing in the open channel. Returns subject for TypingIndicator.
 * Ignores self; entries expire if typing:stop is missed (~3s TTL).
 * Stale other-channel entries are ignored (no reset effect needed).
 */
export function useChannelTyping(args: {
  channelId: string
  currentUserId: string
  enabled?: boolean
}): { typingLabel: string | null } {
  const { channelId, currentUserId, enabled = true } = args
  const { socket, status } = useSocket()

  const canListen =
    enabled && Boolean(socket) && Boolean(channelId) && status === "connected"

  const [typists, setTypists] = useState<Record<string, TypingEntry>>({})

  useEffect(() => {
    if (!canListen || !socket) return

    const onStart = (p: Payload) => {
      const userId = p.userId
      if (!userId || p.channelId !== channelId) return
      if (userId === currentUserId) return

      setTypists((prev) => ({
        ...prev,
        [userId]: {
          fullName: p.fullName?.trim() || "Someone",
          expiresAt: Date.now() + TYPING_TTL_MS,
          channelId,
        },
      }))
    }

    const onStop = (p: Payload) => {
      const userId = p.userId
      if (!userId || p.channelId !== channelId) return

      setTypists((prev) => {
        if (prev[userId] == null) return prev
        const next = { ...prev }
        delete next[userId]
        return next
      })
    }

    socket.on("typing:start", onStart)
    socket.on("typing:stop", onStop)

    const tick = window.setInterval(() => {
      const now = Date.now()
      setTypists((prev) => {
        const next: Record<string, TypingEntry> = {}
        for (const [id, entry] of Object.entries(prev)) {
          // Drop expired; keep other channels until TTL (ignored in label)
          if (entry.expiresAt > now) next[id] = entry
        }
        return Object.keys(next).length === Object.keys(prev).length
          ? prev
          : next
      })
    }, 500)

    return () => {
      socket.off("typing:start", onStart)
      socket.off("typing:stop", onStop)
      window.clearInterval(tick)
    }
  }, [canListen, socket, channelId, currentUserId])

  if (!canListen) return { typingLabel: null }

  // Expiry is pruned by the interval above — render only filters by channel
  const names = Object.values(typists)
    .filter((t) => t.channelId === channelId)
    .map((t) => t.fullName)

  return {
    typingLabel: formatTypingLabel(names),
  }
}
