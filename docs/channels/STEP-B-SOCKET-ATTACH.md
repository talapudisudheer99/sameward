# Step B — Attach Socket.IO (Stage 2)

**Why:** Prove a **long-lived connection** between a client and `server/realtime` on the **same port** as `/health`.  
**Status:** ✅ Step B done (Aug 4, 2026) — matching `socket.id` in smoke + server logs  
**Done when:** server logs `socket connected` and a smoke client logs `connected` with the same `id`; `/health` still works.  
**Not in this step:** session auth, rooms, `message:new`, Next `SocketProvider`.

Stage 1 mental model: connection stays open; attach ≠ new port.

---

## Production shape

```text
node:http Server  (:4001)
   ├─ GET /health          (unchanged)
   └─ Socket.IO attached   (new)
         ▲
         │ long-lived connection
         │
   smoke-client.ts  OR  future browser (Next on :3000)
```

**CORS (term once):** browser security rule — which **web origins** may talk to this server from JS.  
Smoke client is Node → CORS does not apply.  
We still set `origin: http://localhost:3000` now so Next is ready later.

---

## Packages

| Package | Where | Why |
|---------|--------|-----|
| `socket.io` | realtime process | Server API: attach + `connection` / `disconnect` |
| `socket.io-client` | smoke script (dev) | Fake “browser” from terminal |

```bash
npm i socket.io
npm i -D socket.io-client
```

---

## Files

| File | Why |
|------|-----|
| `server/realtime/index.ts` | Attach `Server` from `socket.io` to existing `http.Server` **before** `listen` |
| `server/realtime/smoke-client.ts` | Temporary prover — connect, log id, disconnect (not product UI) |

```json
"realtime:smoke": "tsx server/realtime/smoke-client.ts"
```

---

## Server sketch (what to aim for)

Order matters:

```text
1. createServer(httpHandler)     // health
2. new Server(httpServer, { cors })  // ATTACH — do not listen twice
3. io.on("connection", ...)
4. httpServer.listen(port)
```

**Wrong:** `io.listen(4002)` as a second port — breaks “same server / same port.”

---

## Execution trace — success

**Terminal 1 — realtime already running with Socket.IO**

```text
[realtime] listening on http://localhost:4001
[realtime] health: GET http://localhost:4001/health
[realtime] socket.io attached
```

**Terminal 2 — smoke**

```text
BEFORE connect:
  url = "http://localhost:4001"

AFTER connect:
  socket.id = "Ab12Xy..."
  console: [smoke] connected id=Ab12Xy...

SERVER at same moment:
  console: [realtime] socket connected id=Ab12Xy...

AFTER smoke disconnect / exit:
  SERVER: [realtime] socket disconnected id=Ab12Xy...
```

**Health still:**

```text
GET /health → { ok: true, service: "realtime", ts: "..." }
```

---

## Scenarios (separate)

| Scenario | What you see |
|----------|----------------|
| Realtime down, smoke runs | client error / connection refused |
| Two smokes / two connects | two different `socket.id`s; two connect logs |
| Only health, no smoke | no socket logs — process still fine |

---

## Assignment (you implement)

1. Install `socket.io` + `socket.io-client` (client as devDependency is fine)  
2. Update `server/realtime/index.ts`: attach Socket.IO, log connect/disconnect, keep `/health`  
3. Add `server/realtime/smoke-client.ts` + `"realtime:smoke"` script  
4. Restart realtime → run smoke → confirm matching ids in both terminals  
5. Hit `/health` again → still OK  
6. Say **ready for review**

**CORS config (minimum):**

```ts
cors: {
  origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  credentials: true, // needed later for cookies; harmless for smoke
}
```

**Env for smoke (optional):**

```bash
REALTIME_URL=http://localhost:4001 npm run realtime:smoke
```

Default smoke URL: `http://localhost:4001`.

---

## Out of scope

- Reading session cookies / `socket.data.userId`  
- `channel:join`  
- Emitting chat events  
- Wiring Next chat page  

---

[← Step A](./STEP-A-REALTIME-SCAFFOLD.md) · [Sockets →](./SOCKETS.md) · [Tasks →](./TASKS.md)
