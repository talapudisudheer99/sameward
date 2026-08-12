# Lib & models — Channels (✅ as built)

Follow [folder-structure.md](../architecture/folder-structure.md). Layout below matches the **shipped** tree (Aug 9, 2026).

## Layout

```text
lib/models/channel/
  channel.ts                 # ✅ + visibility dm, dmPairKey
  channel-membership.ts      # ✅ private + DM access
  channel-read-state.ts      # ✅ per-user lastReadAt cursor (unread)
  message.ts                 # ✅ + mentionedUserIds[]

lib/schemas/channel/
  channel-schema.ts          # ✅ create/rename + visibility
  dm-schema.ts               # ✅ open DM { userId }
  message-schema.ts          # ✅ body-or-attachments + mentionedUserIds
  channel-members-schema.ts  # ✅ add/remove private members
  upload-schema.ts           # ✅ batch presign request (files[] name/mime/sizeBytes)

lib/channels/
  create-channel.ts          # ✅ public|private only (DMs → find-or-create-dm)
  find-or-create-dm.ts       # ✅ 1:1 DM find-or-create + resolveDmPeer
  chat-ui-helpers.ts         # ✅ dmListItemToChannel + resolveMentionCandidates
  ensure-default-general.ts  # ✅ public #general, idempotent
  access.ts                  # ✅ canAccessChannel + requireChannelAccess (dm like private)
  unread.ts                  # ✅ batch unreadCount + lastReadAt for channel list
  require-private-channel-gate.ts # ✅
  channel-slugify.ts         # ✅
  channel-room.ts / workspace-room.ts # ✅ room-name helpers
  notify-realtime.ts         # ✅ POST realtime /internal/emit (Next → server/realtime)
  format-typing-label.ts     # ✅ "A is typing…" formatting
  attachment-limits.ts       # ✅ shared 10MB / 3 files / MIME allowlist (client + server)

lib/storage/
  s3.ts                      # ✅ presign PUT/GET, buildAttachmentKey, isManagedObjectUrl
  upload-client.ts           # ✅ browser: PUT to S3 (Promise.all) → clean attachment metadata

# REST lives only under Next
# app/api/workspaces/.../channels/[channelId]/messages/route.ts   ✅ (text + attachments, presigned GET on read)
# app/api/workspaces/.../channels/[channelId]/uploads/route.ts    ✅ (batch presign)

server/realtime/             # Separate process — Railway service #2 (or local port)
  index.ts                   # ✅ HTTP + Socket.IO listen, health
  auth.ts                    # ✅ handshake → userId
  channel-handlers.ts        # ✅ channel:join/leave + canAccessChannel
  typing-handlers.ts         # ✅ typing:start/stop
  workspace-handlers.ts      # ✅ presence (ref-counted sockets)
  internal-http.ts           # ✅ POST /internal/emit (REALTIME_INTERNAL_SECRET)

store/api/channel/channel-api.ts   # ✅ getMessages + createMessage
store/api/upload/upload-api.ts     # ✅ presignChannelUploads
components/providers/socket-provider.tsx  # ✅ global socket, join/leave, live append
lib/types/upload/upload-types.ts   # ✅ Attachment + presign request/response types
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

## Packages

| Slice | Packages | Status |
|-------|----------|--------|
| Realtime skeleton | `socket.io`, `socket.io-client` | ✅ installed |
| Files | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` (PO lock: AWS S3) | ✅ installed |
| Optional image compress | `browser-image-compression` (client) | ⬜ not used |

---

## Status

✅ **All channel lib/models/realtime files shipped and E2E-verified (Aug 9, 2026).**  
Next additions: threads / Redis adapter (multi-instance). Edit/delete + reactions are shipped (`editedAt`/`deletedAt`/`reactions` on `message.ts`).

---

[← Frontend](./FRONTEND.md) · [Tasks →](./TASKS.md)
