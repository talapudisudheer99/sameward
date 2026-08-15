import type { Socket } from "socket.io"

import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies"
import { resolveUserFromSessionToken } from "@/lib/auth/session-user"

/**
 const socket = {
    id:"Abc123",

    handshake:{
        headers:{
            cookie:"sameward_session=abc123"
        },
        auth:{
            token:"..."
        }
    },

    emit(){},

    join(){},

    leave(){},

    disconnect(){},

    data:{}
}
 */

/**
 * Parse `name=value` from a Cookie header (browser or smoke extraHeaders).
 */
export function readCookie(
  cookieHeader: string | undefined,
  name: string
): string | null {
  if (!cookieHeader) return null

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq)
    if (key !== name) continue
    return decodeURIComponent(trimmed.slice(eq + 1))
  }

  return null
}

/**
 * Raw session token from handshake:
 * 1. Cookie `sameward_session` (browser withCredentials)
 * 2. `handshake.auth.token` (smoke / future short-lived token)
 */
export function readHandshakeSessionToken(socket: Socket): string | null {
  const fromCookie = readCookie(
    socket.handshake.headers.cookie,
    SESSION_COOKIE_NAME
  )
  if (fromCookie) return fromCookie

  const authToken = socket.handshake.auth?.token
  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken
  }

  return null
}

/**
 * Socket.IO middleware — runs BEFORE `connection`. it autimatically pasess the socket object to the middleware function. io.use((socket, next) => {})
 * Success → stamp socket.data; failure → client sees connect_error "unauthorized".
 */
export async function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const token = readHandshakeSessionToken(socket)
    if (!token) {
      next(new Error("unauthorized"))
      return
    }

    const user = await resolveUserFromSessionToken(token)
    if (!user) {
      next(new Error("unauthorized"))
      return
    }

    socket.data.userId = user.id
    socket.data.fullName = user.fullName
    next()
  } catch (err) {
    console.error("[realtime] auth middleware error:", err)
    next(new Error("unauthorized"))
  }
}
