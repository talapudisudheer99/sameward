# Data model — Channels & messages

## Collections (planned)

### `channels`

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | required, indexed |
| `name` | string | display (e.g. General) |
| `slug` | string | unique **per workspace** (e.g. `general`) |
| `visibility` | enum | `public` \| `private` |
| `isDefault` | boolean | `#general` |
| `createdBy` | ObjectId → User | |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** `{ workspaceId: 1, slug: 1 }` unique · `{ workspaceId: 1 }`

### `channel_memberships` (private access)

| Field | Type | Notes |
|-------|------|--------|
| `channelId` | ObjectId | required |
| `workspaceId` | ObjectId | denormalized for queries |
| `userId` | ObjectId | required |
| `createdAt` / `updatedAt` | dates | |

**Unique:** `{ channelId: 1, userId: 1 }`

Public channels do **not** require rows here (workspace membership is enough).

### `messages`

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | tenant scope |
| `channelId` | ObjectId | indexed |
| `authorId` | ObjectId → User | |
| `body` | string | max ~4000; may be empty if attachments-only (allow either body or ≥1 attachment) |
| `attachments` | array | `{ url, name, mime, sizeBytes }` ≤ 3 |
| `clientMessageId` | string? | optional idempotency |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** `{ channelId: 1, createdAt: -1 }` · optional unique `{ channelId, clientMessageId }` sparse

**Reserved (not used in v1 UI):** `parentMessageId` for future threads.

### Presence / typing

**Not** stored as primary product collections in v1 — in-memory (or Redis later) on the Socket.IO service.

---

## Access rules (data meaning)

| Visibility | List/open/post if |
|------------|-------------------|
| `public` | Workspace `Membership` exists |
| `private` | Workspace `Membership` **and** `ChannelMembership` |

Create channel: workspace role `owner` \| `admin`.

---

## Relationship shape

```text
Workspace 1 ──< Channel
Channel (private) 1 ──< ChannelMembership >── User
Channel 1 ──< Message >── User (author)
```

---

## `#general` rules

- Created with workspace (and lazy-ensure)
- `visibility: public`, `isDefault: true`
- v1: do not allow deleting the last remaining channel; prefer soft-block delete of `isDefault` unless another channel exists (finalize in TASKS)

---

[← E2E flows](./E2E-FLOWS.md) · [API routes →](./API-ROUTES.md)
