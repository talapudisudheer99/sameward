# API routes — Channels (planned REST)

Base: under `/api/workspaces/[workspaceId]/…`  
All require session via `getCurrentUser()` unless noted.  
Proxy is **not** enough — enforce membership in handlers.

| Method | Path | Who | Purpose | Status |
|--------|------|-----|---------|--------|
| GET | `/api/workspaces/:id/channels` | member | List accessible channels | ✅ |
| POST | `/api/workspaces/:id/channels` | owner \| admin | Create public/private | ✅ |
| GET | `/api/workspaces/:id/channels/:channelId` | allowed | Get one | ✅ |
| PATCH | `/api/workspaces/:id/channels/:channelId` | owner \| admin | Rename / metadata | ✅ |
| DELETE | `/api/workspaces/:id/channels/:channelId` | owner \| admin | Delete (rules for `#general`) | ✅ |
| GET | `.../channels/:channelId/members` | allowed | Private channel members | ✅ |
| POST | `.../channels/:channelId/members` | owner \| admin | Add workspace members to private | ✅ |
| DELETE | `.../channels/:channelId/members/:userId` | owner \| admin | Remove from private | ✅ |
| GET | `.../channels/:channelId/messages` | allowed | History (cursor) | ✅ |
| POST | `.../channels/:channelId/messages` | allowed | Create message (+ attachment refs) | ✅ (text only; attachments later) |
| POST | upload helper (provider-specific) | member | File upload / presign | ⬜ |

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

**T11 body (text only):**
```json
{
  "body": "Hello",
  "clientMessageId": "optional-uuid"
}
```

- `attachments` from the client are **ignored** (forced to `[]`) until S3 upload.
- `body` must be non-empty after trim (Zod).
- Optional `clientMessageId`: idempotent — retry returns the same message (**200**); first create **201**.
- `notifyRealtime` skipped until T15.

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

Channel CRUD + private members + messages REST (text): ✅  
Upload + realtime notify: ⬜ until later slices.

---

[← Data model](./DATA-MODEL.md) · [Sockets →](./SOCKETS.md)
