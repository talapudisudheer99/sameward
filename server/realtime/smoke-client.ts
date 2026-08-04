import { io } from "socket.io-client"

/**
 * Step B smoke — temporary prover, not product UI.
 * Connect → log id → disconnect → exit.
 *
 * Terminal A: npm run realtime
 * Terminal B: npm run realtime:smoke
 */
const url = process.env.REALTIME_URL ?? "http://localhost:4001"
const CONNECT_TIMEOUT_MS = 5_000

console.log(`[smoke] connecting to ${url}`)

const socket = io(url, {
  transports: ["websocket"],
  // Keep trying until our failTimer — useful when realtime is slow to boot
  reconnection: true,
  reconnectionAttempts: Infinity,
})

const failTimer = setTimeout(() => {
  console.error(
    `[smoke] timed out after ${CONNECT_TIMEOUT_MS}ms — is realtime running?`
  )
  socket.close()
  process.exit(1)
}, CONNECT_TIMEOUT_MS)

socket.on("connect", () => {
  clearTimeout(failTimer)
  console.log(`[smoke] connected id=${socket.id}`)
  socket.disconnect()
})

socket.on("disconnect", () => {
  console.log(`[smoke] disconnected`)
  process.exit(0)
})

socket.on("connect_error", (err) => {
  // Don't exit here — server may be down briefly; failTimer is the real deadline
  console.error(`[smoke] connect_error: ${err.message} (retrying until timeout)`)
})
