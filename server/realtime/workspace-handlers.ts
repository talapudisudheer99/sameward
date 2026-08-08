import { workspaceRoomName } from "@/lib/channels/workspace-room"
import { connectDB } from "@/lib/db/mongoose"
import { Membership } from "@/lib/models/workspace/membership"
import type { Server, Socket } from "socket.io"

type JoinPayload = { workspaceId?: string }

/**
 * workspaceId → userId → socketIds (multi-tab: one user, many sockets).
 * Process memory only — fine for single realtime instance (v1).
 *
 *
 *
 *
 *example --> {
  w1: {

    u1: Set {
      "socket101",
      "socket102",
      "socket103"
    },

    u2: Set {
      "socket201",
      "socket202"
    },

    u3: Set {
      "socket301",
      "socket302",
      "socket303",
      "socket304"
    }

  }

  w2: {
    u1: Set {
      "socket401",
      "socket402",
      "socket403"
    },
  }
}
 */
const onlineByWorkspace = new Map<string, Map<string, Set<string>>>()

/** Track this socket as online in the workspace. */
function addSocket(
  workspaceId: string,
  userId: string,
  socketId: string
): void {
  let users = onlineByWorkspace.get(workspaceId)
  if (!users) {
    users = new Map()
    onlineByWorkspace.set(workspaceId, users)
  }

  let sockets = users.get(userId)

  if (!sockets) {
    sockets = new Set()
    users.set(userId, sockets)
  }

  sockets.add(socketId)
}

/**
 * Remove this socket. Returns workspaces that changed (for rebroadcast).
 * If the user's last socket left, drop the user from the online set.
 */

function removeSocket(socketId: string, userId: string): string[] {
  if (!userId) return []
  const changed: string[] = []

  for (const [workspaceId, users] of onlineByWorkspace) {
    const sockets = users.get(userId)
    if (!sockets?.has(socketId)) continue

    sockets.delete(socketId)
    if (sockets.size === 0) {
      users.delete(userId)
    }

    if (users.size === 0) {
      onlineByWorkspace.delete(workspaceId)
    }
    changed.push(workspaceId)
  }

  return changed
}

/**
 * Broadcast the full online list to the room.
 */
function broadcastPresence(io: Server, workspaceId: string): void {
  io.to(workspaceRoomName(workspaceId)).emit("presence:update", {
    onlineUserIds: [...(onlineByWorkspace.get(workspaceId)?.keys() ?? [])],
  })
}

/**
 * T18 — workspace presence. Register next to channel/typing handlers.
 * Needs `io` so we can broadcast the full online list to the room.
 */

export function registerWorkspaceHandlers(io: Server, socket: Socket): void {
  socket.on("workspace:join", async (payload: JoinPayload) => {
    const userId = socket.data.userId as string | undefined

    const workspaceId = payload.workspaceId

    if (!userId) {
      socket.emit("presence:error", {
        code: "unauthorized",
        message: "Not authenticated",
      })

      return
    }

    if (!workspaceId || typeof workspaceId !== "string") {
      socket.emit("presence:error", {
        code: "bad_request",
        message: "workspaceId required",
      })
      return
    }

    try {
      await connectDB()
      const membership = await Membership.findOne({
        workspaceId,
        userId,
      }).lean()

      if (!membership) {
        socket.emit("presence:error", {
          code: "join_denied",
          workspaceId,
          reason: "not_a_member",
        })
        return
      }

      const room = workspaceRoomName(workspaceId)
      await socket.join(room)

      addSocket(workspaceId, userId, socket.id)
      broadcastPresence(io, workspaceId)
    } catch (err) {
      console.error("[realtime] workspace:join error:", err)
      socket.emit("presence:error", {
        code: "server_error",
        workspaceId,
        message: "Join failed",
      })
    }
  })

  socket.on("workspace:leave", async (payload: JoinPayload) => {
    const userId = socket.data.userId as string | undefined
    const workspaceId = payload.workspaceId

    if (!userId || !workspaceId || typeof workspaceId !== "string") {
      return
    }

    const room = workspaceRoomName(workspaceId)
    await socket.leave(room)

    const changed = removeSocket(socket.id, userId)

    for (const changedWorkspaceId of changed) {
      broadcastPresence(io, changedWorkspaceId)
    }
  })

  // Fires while rooms are still known — clean up before the socket fully closes.
  socket.on("disconnecting", () => {
    const userId = socket.data.userId as string | undefined
    if (!userId) return

    const changed = removeSocket(socket.id, userId)

    for (const changedWorkspaceId of changed) {
      broadcastPresence(io, changedWorkspaceId)
    }
  })
}
