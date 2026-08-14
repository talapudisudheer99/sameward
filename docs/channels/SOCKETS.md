# Sockets — separate Socket.IO service

**Status:** ✅ **Implemented (T13–T18) · E2E verified 2026-08-09.** Files below are the shipped mapping.

| Concept | Shipped file |
|---------|--------------|
| Listen + Socket.IO attach + health | `server/realtime/index.ts` |
| Handshake auth → `socket.data.userId` | `server/realtime/auth.ts` |
| `channel:join`/leave + access re-check | `server/realtime/channel-handlers.ts` |
| Typing events | `server/realtime/typing-handlers.ts` |
| Workspace presence (ref-counted sockets) | `server/realtime/workspace-handlers.ts` |
| Internal emit endpoint (Next → realtime) | `server/realtime/internal-http.ts` |
| Next-side notify caller | `lib/channels/notify-realtime.ts` |
| Room name helpers | `lib/channels/channel-room.ts` · `lib/channels/workspace-room.ts` |
| Client provider + hooks | `components/providers/socket-provider.tsx` · `hooks/channels/use-channel-typing.ts` · `hooks/workspace/user-workspace-presence.ts` |

**PO lock:** TeamHub runs a **dedicated Socket.IO process** (not inside serverless Route Handlers).

Next.js owns REST + UI. Realtime service owns persistent connections, rooms, typing, presence, and fan-out.

**Deploy (locked Aug 4, 2026 — Option B):** **Railway** hosts both Next and Socket.IO (always-on).  
**Code:** keep them in **separate folders/processes** (`app/api` vs `server/realtime`) so a later host split is env-only.  
Full why + layout: [docs/architecture/deploy.md](../architecture/deploy.md).

---

## Why separate process (even on one platform)

| Concern | Detail |
|---------|--------|
| Persistence | WebSockets need a long-lived Node process |
| Deploy | **Railway** for Next + realtime (always-on; not a serverless-only host) |
| Migrate later | Two services / two folders → move realtime without rewriting REST |
| Learning | Real Socket.IO rooms, auth, reconnect — not a black-box vendor |

---

## Process layout (target)

```text
apps/web          → Next.js (this repo: app/ + app/api) — UI + REST
apps/realtime     → Socket.IO (this repo: server/realtime/) — fan-out only
```

Until a formal monorepo split, **`server/realtime/`** at repo root is the realtime app.  
Do **not** merge Socket.IO into `app/api` — that blocks Option B’s “easy migrate later” rule.

**Env:** `NEXT_PUBLIC_REALTIME_URL`, `REALTIME_INTERNAL_SECRET` (Next → realtime emit), shared session strategy.  
**Host:** Railway (both processes/services) — [deploy.md](../architecture/deploy.md).

---

## Auth handshake

1. Browser connects with credentials (`withCredentials`) or short-lived realtime token from Next.
2. Server validates session (cookie parse against same secret / call Next introspect / JWT).
3. Unauthenticated → reject connection.
4. Store `socket.data.userId` for all later events.

---

## Rooms

| Room | Join when | Purpose |
|------|-----------|---------|
| `workspace:{workspaceId}` | Enter workspace chat shell | Presence |
| `channel:{channelId}` | Open a channel | Messages + typing |

**Authorize join:** re-check workspace membership; if channel private, channel membership. Deny → error event, do not join.

---

## Events (v1)

| Event | Direction | Payload (sketch) |
|-------|-----------|------------------|
| `message:new` | server → room | full message DTO |
| `message:update` | server → room | edited message DTO (`editedAt` set) |
| `message:delete` | server → room | tombstone DTO (`deletedAt` set; empty body/attachments) |
| `typing:start` / `typing:stop` | client → server → room | `{ channelId, userId, fullName? }` |
| `presence:update` | server → workspace room | `{ onlineUserIds: string[] }` or diff |
| `channel:join` / leave | client → server | `{ channelId }` |

Clients **do not** invent messages only on socket. Send path = REST (or REST + ack); socket is fan-out.

### Next → realtime notify (after REST write)

Option A: Next `POST http://realtime/internal/emit` with shared secret + `{ room, event, payload }`  
Option B: Redis pub/sub (better when scaling)

**v1 ships Option A** — `internal-http.ts` (guarded by `REALTIME_INTERNAL_SECRET`), called from `notify-realtime.ts`.

---

## Frontend duties

- Single `SocketProvider` for the app shell (or workspace layout)
- On channel open: `channel:join`; on leave: leave room
- On `message:new`: append / update RTK cache; dedupe by `id` or `clientMessageId`
- On `message:update` / `message:delete`: patch the same message row in RTK (keep tombstone in place)
- Reconnect handler: re-join active channel + optional history gap fetch
- Throttle typing emits
- Show “Reconnecting…” when disconnected

---

## Production / UX edge cases

| Case | Mitigation |
|------|------------|
| Deploy kills sockets | Auto-reconnect + gap fetch |
| Multi-instance realtime | Redis adapter (later) |
| Removed from workspace | Force leave rooms; REST 404 |
| Duplicate tabs | Dedupe message ids |
| Typing spam | Throttle + ignore non-members |
| Stale presence | Heartbeat / disconnect cleanup |
| CORS | Allow web origin only |

---

## Packages

| Package | Where | Status |
|---------|--------|--------|
| `socket.io` | realtime service | ✅ installed |
| `socket.io-client` | Next client | ✅ installed |
| `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | Next (files slice) | ✅ installed |
| `@socket.io/redis-adapter` | multi-instance | ⬜ later when scaling |

---

## Interview lines

> “HTTP is the source of truth for messages; Socket.IO is the notification bus.”  
> “We authorize every room join the same way we authorize REST — membership is not optional because you have a socket.”

---

[← API routes](./API-ROUTES.md) · [Frontend →](./FRONTEND.md)
