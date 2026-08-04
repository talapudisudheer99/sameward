# Deploy topology — TeamHub (PO lock)

**Locked:** Aug 4, 2026 — **Option B**  
**Owner choice:** One always-on platform (**Railway**) runs **Next.js (UI + REST)** and **Socket.IO**.  
**Hard rule:** Code stays **separated by folder/process** so we can split hosts later without a rewrite.

---

## Decision (one diagram)

```text
Browser
   │
   ├─ HTTPS ──► Railway ──► Next.js (UI + app/api REST)
   │                         │
   │                         │ POST /internal/emit (secret)
   │                         │   (localhost in dev; same private network in prod)
   │                         ▼
   └─ WSS  ──► Railway ──► Socket.IO (server/realtime)
                              rooms · typing · presence · fan-out

MongoDB Atlas  ←── Next (+ realtime for authz checks)
AWS S3         ←── Next only (uploads)
Resend / Google OAuth  ←── Next only
```

| Piece | Where it **runs** | Where it **lives in git** |
|-------|-------------------|---------------------------|
| UI + REST | Railway (Next process) | `app/`, `app/api/**` |
| Socket.IO | Railway (realtime process) | `server/realtime/**` |
| Shared rules / models | imported by both | `lib/**` |
| Mongo / S3 / email | Atlas / AWS / vendors | env on Railway |

**Not Vercel for production app** (Option A deferred). Preview-on-Vercel can return later as optional marketing/CD — not required for v1 chat.

---

## Why Option B

| Reason | Detail |
|--------|--------|
| Sockets need always-on Node | Railway fits; Vercel serverless does not |
| One bill / one mental model | Web + realtime on the same platform |
| Still “proper” architecture | REST and sockets are **different processes + folders**, not one spaghetti server |

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
| Sockets inside Vercel / serverless routes | Connections die |
| One mega `server.ts` with Next+io and no `server/realtime` boundary | Hard to migrate; fights App Router defaults |
| Browser-only messages (no REST write) | Two sources of truth |

---

## Interview line

> “We run Next and Socket.IO on Railway so WebSockets stay alive, but we keep REST in `app/api` and realtime in `server/realtime` as separate processes. HTTP is the source of truth; the socket is the notification bus. That layout lets us move realtime to its own host later by changing env, not rewriting chat.”

---

[← Stack](./stack.md) · [Sockets →](../channels/SOCKETS.md) · [Phase 8 →](../phases/08-quality-deployment/README.md)
