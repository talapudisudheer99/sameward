# API routes — Channels (REST · ✅ implemented)

Base: under `/api/workspaces/[workspaceId]/…`  
All require session via `getCurrentUser()` unless noted.  
Proxy is **not** enough — enforce membership in handlers.

| Method | Path | Who | Purpose | Status |
|--------|------|-----|---------|--------|
| GET | `/api/workspaces/:id/channels` | member | List accessible channels (+ unreadCount, lastReadAt); excludes DMs | ✅ |
| POST | `/api/workspaces/:id/channels` | owner \| admin | Create public/private | ✅ |
| GET | `/api/workspaces/:id/dms` | member | List 1:1 DMs (peer + unread) | ✅ |
| POST | `/api/workspaces/:id/dms` | member | Find or create 1:1 DM `{ userId }` | ✅ |
| GET | `/api/workspaces/:id/channels/:channelId` | allowed | Get one (DM name = peer) | ✅ |
| PATCH | `/api/workspaces/:id/channels/:channelId` | owner \| admin | Rename / metadata (not DMs) | ✅ |
| DELETE | `/api/workspaces/:id/channels/:channelId` | owner \| admin | Delete (rules for `#general`; not DMs) | ✅ |
| POST | `.../channels/:channelId/read` | allowed | Upsert per-user lastReadAt cursor | ✅ |
| GET | `.../channels/:channelId/members` | allowed | Private channel members | ✅ |
| POST | `.../channels/:channelId/members` | owner \| admin | Add workspace members to private | ✅ |
| DELETE | `.../channels/:channelId/members/:userId` | owner \| admin | Remove from private | ✅ |
| GET | `.../channels/:channelId/messages` | allowed | History (cursor) | ✅ |
| POST | `.../channels/:channelId/messages` | allowed | Create message (text + attachment refs) | ✅ (text + attachments) |
| POST | `.../channels/:channelId/uploads` | allowed | Batch presign PUT for attachments | ✅ (S3 presigned) |

Live delivery is **not** REST — see [SOCKETS.md](./SOCKETS.md).

---

## Request sketches

### `POST .../channels`

```json
{ "name": "Hiring", "visibility": "private" }
```

**201:** `{ id, name, slug, visibility, isDefault }`

### `GET .../channels`

**200:** `{ channels: [{ id, name, slug, visibility, isDefault }, ...] }`  
Only channels the caller may access.

### `POST .../channels/:channelId/members`

```json
{ "userIds": ["…"] }
```

Workspace members only. Private channels only (public → **400**).

### `GET .../messages?cursor=&limit=`

**Who:** caller must `canAccessChannel` (workspace member; private also needs channel membership). Non-access → **404**.

**Query:**
| Param | Default | Notes |
|-------|---------|--------|
| `limit` | `50` | Clamped 1–100 |
| `cursor` | omitted | ISO `createdAt` of the oldest message from the previous page |

**Convention (newest page first, then older):**
1. No `cursor` → newest `limit` messages
2. With `cursor` → messages with `createdAt < cursor` (older history)
3. DB sort: `createdAt` descending; server fetches `limit + 1` to know if an older page exists
4. Response `messages` are **oldest → newest** (transcript order)
5. `nextCursor` = oldest `createdAt` in this page (ISO), or `null` if no more pages

**200:**
```json
{
  "messages": [
    {
      "id": "...",
      "channelId": "...",
      "authorId": "...",
      "authorName": "...",
      "body": "Hello",
      "attachments": [],
      "createdAt": "2026-08-02T12:00:00.000Z"
    }
  ],
  "nextCursor": "2026-08-01T10:00:00.000Z"
}
```

### `POST .../messages`

**Who:** same access as GET messages. Non-access → **404**.

**Body (text and/or attachments):**
```json
{
  "body": "Hello",
  "attachments": [
    { "url": "s3://…canonical…", "name": "shot.png", "mime": "image/png", "sizeBytes": 12345 }
  ],
  "clientMessageId": "optional-uuid"
}
```

- Must have **`body` (non-empty after trim) OR ≥1 attachment** (Zod).
- `attachments[].url` must pass `isManagedObjectUrl` (our bucket only) — external URLs rejected.
- Server stores the **canonical private S3 URL**; read paths sign a short-lived presigned GET.
- Optional `clientMessageId`: idempotent — retry returns the same message (**200**); first create **201**.
- On create, `notifyRealtime` fans out `message:new` (already-signed DTO) to `channel:{id}`.

### `POST .../channels/:channelId/uploads`

Batch presign — call once with all selected files; returns one presigned PUT per file.

```json
{ "files": [ { "name": "shot.png", "mime": "image/png", "sizeBytes": 12345 } ] }
```

- Same access check as messages; enforces max 3 files · ≤10MB · MIME allowlist (`lib/channels/attachment-limits.ts`).
- **200:** `{ uploads: [ { key, uploadUrl, url, name, mime, sizeBytes } ] }` — client PUTs the file to `uploadUrl`, then sends `url` in the message.

**201 / 200** (same shape as one history item):
```json
{
  "id": "...",
  "channelId": "...",
  "authorId": "...",
  "authorName": "...",
  "body": "Hello",
  "attachments": [],
  "createdAt": "2026-08-02T12:00:00.000Z"
}
```

---

## Authz matrix

| Action | Check |
|--------|--------|
| List/get public channel | Workspace membership |
| List/get private channel | Workspace + channel membership |
| Create / patch / delete channel | owner \| admin |
| Add/remove private members | owner \| admin |
| Post message | Allowed to access channel |
| Upload | Same as post (+ MIME/size) |

Non-access → **404** (same as workspaces).

---

## Status

Channel CRUD + private members + messages REST (text + attachments): ✅  
Batch presign uploads (S3 PUT) + presigned GET on read + realtime notify: ✅  
Message edit/delete: ⬜ deferred to Slice 8 (`PATCH`/`DELETE …/messages/:id`).

---

[← Data model](./DATA-MODEL.md) · [Sockets →](./SOCKETS.md)
