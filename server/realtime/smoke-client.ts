import { io } from "socket.io-client"

/**
 * Auth smoke for Step C.
 *
 * Without SMOKE_SESSION_TOKEN → expects connect_error "unauthorized" (pass).
 * With SMOKE_SESSION_TOKEN=<raw teamhub_session value> → expects connect + optional join.
 *
 * Terminal A: npm run realtime
 * Terminal B: npm run realtime:smoke
 * Auth pass:  SMOKE_SESSION_TOKEN=... npm run realtime:smoke
 * Join test:  SMOKE_SESSION_TOKEN=... SMOKE_CHANNEL_ID=... npm run realtime:smoke
 */
const url = process.env.REALTIME_URL ?? "http://localhost:4001"
const token = process.env.SMOKE_SESSION_TOKEN
const channelId = process.env.SMOKE_CHANNEL_ID
const CONNECT_TIMEOUT_MS = 8_000
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
    `[smoke] timed out after ${CONNECT_TIMEOUT_MS}ms — is realtime running? Mongo up?`
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
  pass(`joined channel:${payload.channelId}`)
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
