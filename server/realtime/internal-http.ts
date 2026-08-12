import type { IncomingMessage, ServerResponse } from "node:http"
import type { Server as SocketServer } from "socket.io"

type EmitBody = {
  room?: unknown
  event?: unknown
  payload?: unknown
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim()
  if (!raw) return null
  return JSON.parse(raw) as unknown
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>
): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

/**
 * Next → realtime fan-out door (not for browsers).
 * POST /internal/emit
 * Header: x-realtime-secret: <REALTIME_INTERNAL_SECRET>
 * Body: { room, event, payload }
 *
 * Returns true when this request was handled (caller should not 404).
 */
export async function tryHandleInternalEmit(
  req: IncomingMessage,
  res: ServerResponse,
  io: SocketServer
): Promise<boolean> {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname
  if (pathname !== "/internal/emit") return false

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" })
    return true
  }

  const expected = process.env.REALTIME_INTERNAL_SECRET
  if (!expected) {
    console.error(
      "[realtime] REALTIME_INTERNAL_SECRET is not set — refuse /internal/emit"
    )
    sendJson(res, 503, { ok: false, message: "Emit not configured" })
    return true
  }

  const provided = req.headers["x-realtime-secret"]
  if (typeof provided !== "string" || provided !== expected) {
    sendJson(res, 401, { ok: false, message: "Unauthorized" })
    return true
  }

  let body: EmitBody
  try {
    body = (await readJsonBody(req)) as EmitBody
  } catch {
    sendJson(res, 400, { ok: false, message: "Invalid JSON body" })
    return true
  }

  const room = body?.room
  const event = body?.event
  if (typeof room !== "string" || room.length === 0) {
    sendJson(res, 400, { ok: false, message: "room required" })
    return true
  }
  if (typeof event !== "string" || event.length === 0) {
    sendJson(res, 400, { ok: false, message: "event required" })
    return true
  }

  io.to(room).emit(event, body.payload ?? null)
  console.log(`[realtime] emit event=${event} room=${room}`)
  sendJson(res, 200, { ok: true })
  return true
}
