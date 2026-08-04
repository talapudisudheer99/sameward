# Lib & models — Channels (planned)

Follow [folder-structure.md](../architecture/folder-structure.md). Paths below are **targets** — create when the matching task starts.

## Layout

```text
lib/models/channel/
  channel.ts                 # ✅ T1 — workspaceId, name, slug, visibility, isDefault, createdBy
  channel-membership.ts      # ✅ T2 — private-channel access only
  message.ts                 # ✅ T3 — body + attachments metadata; socket announces later

lib/schemas/channel/
  channel-schema.ts          # create/rename + visibility
  message-schema.ts
  channel-members-schema.ts
  attachment-meta-schema.ts

lib/channels/
  create-channel.ts
  ensure-default-general.ts  # ✅ T4 — public #general, idempotent
  access.ts                  # canAccessChannel + requireChannelAccess
  notify-realtime.ts         # POST to realtime internal emit (Next → server/realtime)

# REST lives only under Next — do not put Socket.IO here
# app/api/workspaces/.../messages/route.ts

server/realtime/             # Separate process — Railway service #2 (or local port)
  index.ts                   # HTTP + Socket.IO listen, health
  auth.ts                    # handshake → userId
  rooms.ts                   # channel:join + canAccessChannel
  presence.ts
  internal-http.ts           # POST /internal/emit (REALTIME_INTERNAL_SECRET)

store/api/channel/channel-api.ts
components/providers/…       # SocketProvider (client) — later
```

**Boundary:** `app/api` = truth writes · `server/realtime` = live fan-out · `lib/*` = shared.  
Deploy/migrate rules: [../architecture/deploy.md](../architecture/deploy.md).

---

## Helpers (intent)

| Helper | Purpose |
|--------|---------|
| `ensureDefaultGeneral` | Create `#general` if missing |
| `canAccessChannel` | Boolean policy: public→ok; private→+ChannelMembership (caller already has workspace + channel) |
| `requireChannelAccess` | HTTP gate: ids → Membership → Channel → `canAccessChannel` → 404 |
| `notifyRealtime` | After message create, fan-out |
| Socket `auth` | Map handshake → userId |
| Socket `presence` | Track online set per workspace |

---

## Packages (install per slice — not yet)

| Slice | Packages |
|-------|----------|
| Realtime skeleton | `socket.io`, `socket.io-client` |
| Files | UploadThing **or** AWS S3 / R2 SDK — **PO lock before slice** |
| Optional image compress | `browser-image-compression` (client) |

---

## Status

Nothing in this tree is required to exist until [TASKS.md](./TASKS.md) says so. Keep this file in sync when files land.

---

[← Frontend](./FRONTEND.md) · [Tasks →](./TASKS.md)
