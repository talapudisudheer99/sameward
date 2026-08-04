# Step A — Realtime scaffold (Stage 2)

**Why:** Prove a second Node process can boot and answer HTTP — before Socket.IO, rooms, or chat.  
**Status:** ✅ Step A done (Aug 4, 2026)  
**Done when:** `GET /health` → `200` + `{ ok: true, ... }` while `next dev` can still run on `:3000`.

Parent mental model: [MENTORSHIP.md](../MENTORSHIP.md) · Deploy: [deploy.md](../architecture/deploy.md)

---

## Production shape (what we’re building)

```text
Terminal A:  next dev              → :3000  (unchanged)
Terminal B:  npm run realtime      → :4001  (new)

curl http://localhost:4001/health
→ 200 {"ok":true,"service":"realtime","ts":"..."}
```

**Not yet:** Socket.IO client, `message:new`, Mongo, Railway.

---

## Terms (once each)

| Term | Meaning |
|------|---------|
| **Port** | Number on your machine that identifies which program receives traffic (`3000` vs `4001`) |
| **Listen** | Process waits for connections on that port |
| **HTTP server** | Program that understands GET/POST (Node built-in `node:http`) |
| **Health check** | Tiny GET route ops/tools call to ask “are you up?” — not a Socket.IO connection |

Socket.IO later **attaches** to this same HTTP server. Step A only builds the HTTP shell + `/health`.

---

## Why these files

```text
server/realtime/
  index.ts     # create server, listen, route /health, log startup
```

| File | Why it exists |
|------|----------------|
| `index.ts` | Single entry so Railway / `npm run realtime` has one command |
| (later) `auth.ts`, `rooms.ts`, `internal-http.ts` | Split when behavior arrives — don’t invent empty stubs unless you want placeholders |

**Why not Express yet?** Zero new deps for Step A; Node `http` is enough. We can add Express/Fastify later if routing grows — not required for health.

**Why not Socket.IO in Step A?** One concept at a time. Health first → then attach `socket.io` to the same server.

---

## Env

| Name | Example | Role |
|------|---------|------|
| `REALTIME_PORT` | `4001` | Listen port (default `4001` if unset) |

Optional later: `REALTIME_INTERNAL_SECRET` — not required for `/health`.

Add to `.env.local` (and document in auth PRODUCTION / deploy):

```bash
REALTIME_PORT=4001
```

---

## package.json

```json
"realtime": "tsx server/realtime/index.ts"
```

**`tsx`:** runs TypeScript without a separate compile step (devDependency).  
Install: `npm i -D tsx`

---

## Execution trace — success

**Before start**

```text
REALTIME_PORT = undefined  → code will use 4001
process not listening
```

**After `http.createServer(...).listen(4001)`**

```text
// console
[realtime] listening on http://localhost:4001
[realtime] GET /health → { ok: true }
```

**Request**

```text
method = "GET"
url    = "/health"
```

**Response**

```text
statusCode = 200
headers    = { "content-type": "application/json; charset=utf-8" }
body       = { ok: true, service: "realtime", ts: "2026-08-04T..." }
```

---

## Scenario: wrong path

```text
GET /nope
→ 404 { ok: false, message: "Not found" }
```

---

## Scenario: port in use

```text
listen EADDRINUSE :::4001
→ process exits
→ curl: connection refused
```

---

## Assignment (you implement)

1. `npm i -D tsx`  
2. Create `server/realtime/index.ts` — `node:http` server, `/health`, 404 else, listen on `REALTIME_PORT \|\| 4001`  
3. Add script `"realtime": "tsx server/realtime/index.ts"`  
4. Put `REALTIME_PORT=4001` in `.env.local` (tsx may not load `.env.local` automatically — either use `dotenv` or export in shell / document `REALTIME_PORT=4001 npm run realtime`)  
5. Run realtime → curl/browser `/health` → paste result when ready for review  

**Lead note on env loading:** Next loads `.env.local` for you; a bare Node process does **not**. Prefer for Step A:

```bash
REALTIME_PORT=4001 npm run realtime
```

or add `dotenv` and load `.env.local` at top of `index.ts` (production-common). Your choice — document which you picked.

---

## Out of scope (do not do yet)

- `socket.io` package  
- Browser client  
- `notify-realtime` from message POST  
- Railway  

---

[← Sockets](./SOCKETS.md) · [Tasks →](./TASKS.md)
