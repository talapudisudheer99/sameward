# Deploy — how Sameward goes live

**Decision locked:** Aug 4, 2026 — **Option B**  
**Host:** **Railway** runs both parts of the app.  
**Rule:** Keep Next and Socket.IO in **separate folders and processes**, so we can move realtime to another host later without rewriting chat.

---

## Simple picture

```text
Browser
   │
   ├─ HTTPS ──► Railway ──► Next.js (pages + REST APIs in app/api)
   │                         │
   │                         │ internal notify (secret)
   │                         ▼
   └─ WSS  ──► Railway ──► Socket.IO (server/realtime)
                              live messages · typing · presence

MongoDB Atlas  ←── used by Next (and realtime when checking membership)
AWS S3         ←── Next only (file uploads)
Resend / Google OAuth  ←── Next only
```

| Piece | Where it runs | Where the code lives |
|-------|---------------|----------------------|
| Website + REST API | Railway service **web** | `app/`, `app/api/**` |
| Live sockets | Railway service **realtime** | `server/realtime/**` |
| Shared helpers / models | Imported by both | `lib/**` |
| Database / files / email | Atlas / AWS / Resend | Env vars on Railway |

**Production host:** Railway only. We do not put Sameward production on Vercel — serverless hosts sleep, and Socket.IO needs a process that stays awake.

---

## Why Railway (Option B)

| Reason | In plain English |
|--------|------------------|
| Sockets need a living server | Railway keeps the process awake; serverless hosts stop idle functions |
| One place to manage | Web + realtime on the same platform (two services, one project) |
| Still clean code | REST and sockets stay in **different folders/processes**, not one mixed file |

---

## Separation rule (migrate-ready)

**Same host ≠ same codebase blob.**

| Do | Don’t |
|----|--------|
| REST only in Next Route Handlers (`app/api`) | Put Socket.IO handlers inside `app/api` route files |
| Sockets only in `server/realtime` | Custom Next server that mixes `getRequestHandler` + io in one file with no boundary |
| Shared authz in `lib/channels`, `lib/auth` | Copy-paste membership checks into realtime only |
| Next → realtime via **HTTP internal emit** + secret | Have the browser invent messages only on the socket |
| Two start scripts / two processes | One process that you can’t split later |

**Later split (easy):**  
Point `NEXT_PUBLIC_REALTIME_URL` at a new host, deploy `server/realtime` alone, keep Next wherever you want. No rewrite of message POST logic — only env + CORS.

---

## Repo layout (target)

```text
teamhub-ai/
  app/                          # Next App Router — UI
  app/api/                      # REST only (source of truth writes)
    workspaces/.../messages/
  lib/                          # Shared (safe for Next + realtime to import)
    auth/
    channels/                   # access.ts, notify-realtime.ts, …
    models/
    schemas/
    types/
  server/
    realtime/                   # Socket.IO service — own entrypoint
      package concerns via root scripts
      index.ts                  # listen, CORS, health
      auth.ts                   # handshake → userId
      rooms.ts                  # channel:join authorize
      presence.ts
      internal-http.ts          # POST /internal/emit (secret)
  components/                   # UI only — no Mongo, no socket server
  store/                        # RTK — client
  docs/architecture/deploy.md   # this file
```

**Process map**

| Script (intent) | Process |
|-----------------|---------|
| `next dev` / `next start` | Web + REST |
| `realtime` → `tsx server/realtime/index.ts` (name TBD in Step A) | Socket.IO |

Railway can run **two services** from one repo (recommended) or one service with a process manager. Prefer **two Railway services** from day one of deploy — same repo, different start commands — so “split” is already practiced.

---

## Env map (names)

| Variable | Next | Realtime | Purpose |
|----------|------|----------|---------|
| `MONGODB_URI` | ✅ | ✅ (when checking membership) | DB |
| `NEXT_PUBLIC_APP_URL` | ✅ | CORS allowlist | Web origin |
| `NEXT_PUBLIC_REALTIME_URL` | ✅ (browser) | — | Socket client URL |
| `REALTIME_INTERNAL_SECRET` | ✅ | ✅ | Next → emit |
| `REALTIME_PORT` | — | ✅ | Socket HTTP port |
| Session / Google / Resend / S3 | ✅ | — | REST + uploads |

Dev: realtime URL `http://localhost:PORT`.  
Prod: Railway public URL for realtime (or private + same-origin proxy later).

---

## Local vs production

| Mode | Next | Realtime |
|------|------|----------|
| **Dev** | `next dev` | `server/realtime` on localhost |
| **Prod** | Railway service `web` | Railway service `realtime` |

Protocol never changes: **POST message → Mongo → notifyRealtime → `message:new`**.

---

## Explicitly rejected

| Idea | Why |
|------|-----|
| Sockets on a serverless host (e.g. Vercel route handlers) | Connections die when the function sleeps |
| One mega `server.ts` with Next+io and no `server/realtime` boundary | Hard to migrate; fights App Router defaults |
| Browser-only messages (no REST write) | Two sources of truth |

---

## Interview line

> “We run Next and Socket.IO on Railway so WebSockets stay alive, but we keep REST in `app/api` and realtime in `server/realtime` as separate processes. HTTP is the source of truth; the socket is the notification bus. That layout lets us move realtime to its own host later by changing env, not rewriting chat.”

---

[← Stack](./stack.md) · [Sockets →](../channels/SOCKETS.md) · [Phase 8 →](../phases/08-quality-deployment/README.md)
