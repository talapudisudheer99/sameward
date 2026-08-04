import { createServer } from "node:http"
import { Server } from "socket.io"

/**
 * Step B — HTTP shell + Socket.IO on the SAME port.
 * Order: createServer → attach Server(http) → connection handlers → listen (once).
 *
 * Run: REALTIME_PORT=4001 npm run realtime
 * Health: GET http://localhost:4001/health
 * Smoke:  npm run realtime:smoke  (second terminal)
 */
const port = Number(process.env.REALTIME_PORT) || 4001
const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

const httpServer = createServer((req, res) => {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname

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

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify({ ok: false, message: "Not found" }))
})

// Attach — do not call io.listen() on another port
const io = new Server(httpServer, {
  cors: {
    origin: appOrigin,
    credentials: true, // cookies later (auth handshake slice)
  },
})

io.on("connection", (socket) => {
  console.log(`[realtime] socket connected id=${socket.id}`)

  socket.on("disconnect", (reason) => {
    console.log(
      `[realtime] socket disconnected id=${socket.id} reason=${reason}`
    )
  })
})

httpServer.listen(port, () => {
  console.log(`[realtime] listening on http://localhost:${port}`)
  console.log(`[realtime] health: GET http://localhost:${port}/health`)
  console.log(`[realtime] socket.io attached (cors origin=${appOrigin})`)
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
