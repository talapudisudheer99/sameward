import { io } from "socket.io-client"

import { loadEnvLocal } from "./load-env"
import { channelRoomName } from "@/lib/channels/channel-room"

loadEnvLocal()

/**
 * Auth + optional join + optional message:new emit smoke (T14–T15).
 *
 * Terminal A: npm run realtime
 * Terminal B:
 *   npm run realtime:smoke
 *   SMOKE_SESSION_TOKEN=... npm run realtime:smoke
 *   SMOKE_SESSION_TOKEN=... SMOKE_CHANNEL_ID=... npm run realtime:smoke
 *     → joins, then POSTs /internal/emit and expects message:new
 */
const url = process.env.REALTIME_URL ?? "http://localhost:4001"
const token = process.env.SMOKE_SESSION_TOKEN
const channelId = process.env.SMOKE_CHANNEL_ID
const secret = process.env.REALTIME_INTERNAL_SECRET
const CONNECT_TIMEOUT_MS = 10_000
const expectAuth = Boolean(token)

console.log(`[smoke] connecting to ${url}`)
console.log(
  `[smoke] mode=${expectAuth ? "authenticated" : "anonymous (expect reject)"}`
)

const socket = io(url, {
  transports: ["websocket"],
  reconnection: false,
  auth: token ? { token } : undefined,
})

const failTimer = setTimeout(() => {
  console.error(
    `[smoke] timed out after ${CONNECT_TIMEOUT_MS}ms — is realtime running? Mongo up? secret set?`
  )
  socket.close()
  process.exit(1)
}, CONNECT_TIMEOUT_MS)

function pass(message: string): void {
  clearTimeout(failTimer)
  console.log(`[smoke] PASS: ${message}`)
  socket.close()
  process.exit(0)
}

function fail(message: string): void {
  clearTimeout(failTimer)
  console.error(`[smoke] FAIL: ${message}`)
  socket.close()
  process.exit(1)
}

async function emitTestMessage(room: string, payload: unknown): Promise<void> {
  if (!secret) {
    fail(
      "REALTIME_INTERNAL_SECRET missing in .env.local — needed to test message:new"
    )
    return
  }

  const res = await fetch(`${url}/internal/emit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-realtime-secret": secret,
    },
    body: JSON.stringify({
      room,
      event: "message:new",
      payload,
    }),
  })

  if (!res.ok) {
    fail(`internal emit HTTP ${res.status}: ${await res.text()}`)
  }
}

socket.on("connect", () => {
  if (!expectAuth) {
    fail(`anonymous connected id=${socket.id} — auth middleware should reject`)
    return
  }

  console.log(`[smoke] connected id=${socket.id}`)

  if (!channelId) {
    pass(`authenticated connection id=${socket.id}`)
    return
  }

  console.log(`[smoke] emitting channel:join ${channelId}`)
  socket.emit("channel:join", { channelId })
})

socket.on("channel:joined", (payload: { channelId: string }) => {
  const room = channelRoomName(payload.channelId)
  const testPayload = {
    id: "smoke-msg-1",
    channelId: payload.channelId,
    authorId: "smoke",
    authorName: "Smoke",
    body: "smoke message:new",
    attachments: [],
    createdAt: new Date().toISOString(),
  }

  console.log(`[smoke] joined ${room} — waiting for message:new via /internal/emit`)

  socket.once("message:new", (msg: { id?: string; body?: string }) => {
    if (msg?.id !== testPayload.id) {
      fail(`unexpected message:new id=${String(msg?.id)}`)
      return
    }
    pass(`received message:new id=${msg.id} body=${msg.body}`)
  })

  void emitTestMessage(room, testPayload)
})

socket.on(
  "channel:error",
  (payload: { code?: string; reason?: string; message?: string }) => {
    fail(
      `channel:error code=${payload.code} reason=${payload.reason ?? payload.message}`
    )
  }
)

socket.on("connect_error", (err) => {
  const msg = err.message || String(err)

  if (!expectAuth && msg.includes("unauthorized")) {
    pass(`rejected anonymous connect (${msg})`)
    return
  }

  if (expectAuth) {
    fail(`authenticated connect failed: ${msg}`)
    return
  }

  fail(`unexpected connect_error: ${msg}`)
})
