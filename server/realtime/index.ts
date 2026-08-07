import { createServer } from "node:http"
import { Server } from "socket.io"

import { loadEnvLocal } from "./load-env"
import { authenticateSocket } from "./auth"
import { tryHandleInternalEmit } from "./internal-http"
import { registerRoomHandlers } from "./rooms"
import { registerTypingHandlers } from "./typing"

loadEnvLocal()

/**
 * T14–T15 — HTTP + Socket.IO + auth + rooms + /internal/emit
 *
 * Run: npm run realtime
 * Health: GET http://localhost:4001/health
 * Emit:  POST /internal/emit (x-realtime-secret)
 */
const port = Number(process.env.REALTIME_PORT) || 4001
const appOrigin =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  "http://localhost:3000"

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: appOrigin,
    credentials: true,
  },
})

io.use(authenticateSocket)

io.on("connection", (socket) => {
  console.log(
    `[realtime] socket connected id=${socket.id} user=${socket.data.userId}`
  )

  registerRoomHandlers(socket)
  registerTypingHandlers(socket)

  socket.on("disconnect", (reason) => {
    console.log(
      `[realtime] socket disconnected id=${socket.id} user=${socket.data.userId} reason=${reason}`
    )
  })
})

// After Socket.IO attaches — leave /socket.io to Engine.IO; handle our routes only.
httpServer.on("request", (req, res) => {
  void (async () => {
    if (res.headersSent) return

    const pathname = new URL(req.url ?? "/", "http://localhost").pathname
    if (pathname.startsWith("/socket.io")) return

    if (req.method === "GET" && pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
      res.end(
        JSON.stringify({
          ok: true,
          service: "realtime",
          ts: new Date().toISOString(),
        })
      )
      return
    }

    if (await tryHandleInternalEmit(req, res, io)) return

    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ ok: false, message: "Not found" }))
  })()
})

httpServer.listen(port, () => {
  console.log(`[realtime] listening on http://localhost:${port}`)
  console.log(`[realtime] health: GET http://localhost:${port}/health`)
  console.log(`[realtime] emit:   POST http://localhost:${port}/internal/emit`)
  console.log(`[realtime] socket.io + auth (cors origin=${appOrigin})`)
})

httpServer.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[realtime] port ${port} already in use — stop the other process or change REALTIME_PORT`
    )
    process.exit(1)
  }
  throw err
})
