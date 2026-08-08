import { useSocket } from "@/components/providers/socket-provider"
import { useEffect, useState } from "react"

type PresencePayload = {
  onlineUserIds: string[]
}

export function useWorkspacePresence(args: {
  workspaceId: string
  enabled?: boolean
}) {
  const { workspaceId, enabled = true } = args

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])

  const { socket, status } = useSocket()

  const canListen = enabled && Boolean(socket) && status === "connected"

  useEffect(() => {
    if (!canListen || !socket) return

    if (!workspaceId || typeof workspaceId !== "string") return

    const onPresence = (p: PresencePayload) => {
      setOnlineUserIds(Array.isArray(p.onlineUserIds) ? p.onlineUserIds : [])
    }

    socket.on("presence:update", onPresence)
    socket.emit("workspace:join", { workspaceId })

    return () => {
      socket.emit("workspace:leave", { workspaceId })
      socket.off("presence:update", onPresence)
    }
  }, [canListen, workspaceId, socket])

  if (!canListen) {
    return { onlineUserIds: [], isOnline: () => false }
  }

  return {
    onlineUserIds,
    isOnline: (userId: string) => onlineUserIds.includes(userId),
  }
}
