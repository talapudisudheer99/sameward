# Data model — Channels & messages

## Collections (planned)

### `channels`

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | required, indexed |
| `name` | string | display (e.g. General) |
| `slug` | string | unique **per workspace** (e.g. `general`) |
| `visibility` | enum | `public` \| `private` \| `dm` |
| `isDefault` | boolean | `#general` |
| `createdBy` | ObjectId → User | |
| `dmPairKey` | string? | 1:1 DM only — sorted `userA_userB`; sparse unique with workspaceId |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** `{ workspaceId: 1, slug: 1 }` unique · `{ workspaceId: 1 }` · `{ workspaceId: 1, dmPairKey: 1 }` unique sparse

### `channel_memberships` (private access)

| Field | Type | Notes |
|-------|------|--------|
| `channelId` | ObjectId | required |
| `workspaceId` | ObjectId | denormalized for queries |
| `userId` | ObjectId | required |
| `createdAt` / `updatedAt` | dates | |

**Unique:** `{ channelId: 1, userId: 1 }`

Public channels do **not** require rows here (workspace membership is enough).

### `channel_read_states` (per-user unread cursor)

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | denormalized |
| `channelId` | ObjectId | required |
| `userId` | ObjectId | required |
| `lastReadAt` | Date | messages newer than this (by others) are unread |
| `createdAt` / `updatedAt` | dates | |

**Unique:** `{ channelId: 1, userId: 1 }`

Works for **public and private** channels (unlike `channel_memberships`). Opening a channel upserts `lastReadAt = now`.

### `messages`

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | tenant scope |
| `channelId` | ObjectId | indexed |
| `authorId` | ObjectId → User | |
| `body` | string | max ~4000; may be empty if attachments-only (allow either body or ≥1 attachment) |
| `attachments` | array | `{ url, name, mime, sizeBytes }` ≤ 3 |
| `clientMessageId` | string? | optional idempotency |
| `mentionedUserIds` | ObjectId[] | @mentions (≤ 20); validated as workspace (+ channel for private/DM) members |
| `reactions` | `{ emoji, userIds[] }[]` | allowlisted emoji; ≤ 20 types; toggle via POST …/reactions |
| `editedAt` | Date \| null | set when author edits body |
| `deletedAt` | Date \| null | soft delete tombstone |
| `deletedBy` | ObjectId \| null | who soft-deleted |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** `{ channelId: 1, createdAt: -1 }` · optional unique `{ channelId, clientMessageId }` sparse

**Soft delete:** API returns tombstone (`body: ""`, `attachments: []`) — never re-exposes content. Unread counts exclude `deletedAt != null`.

**Reserved (not used in v1 UI):** `parentMessageId` for future threads.

### Presence / typing

**Not** stored as primary product collections in v1 — in-memory (or Redis later) on the Socket.IO service.

---

## Access rules (data meaning)

| Visibility | List/open/post if |
|------------|-------------------|
| `public` | Workspace `Membership` exists |
| `private` | Workspace `Membership` **and** `ChannelMembership` |
| `dm` | Workspace `Membership` **and** `ChannelMembership` (exactly two users; listed via `GET …/dms`) |

Create channel: workspace role `owner` \| `admin` (public/private only).  
Open DM: any workspace member → `POST …/dms` find-or-create.

---

## Relationship shape

```text
Workspace 1 ──< Channel (public | private | dm)
Channel (private | dm) 1 ──< ChannelMembership >── User
Channel 1 ──< ChannelReadState >── User   (lastReadAt cursor)
Channel 1 ──< Message >── User (author); Message.mentionedUserIds → User[]
```

---

## `#general` rules

- Created with workspace (and lazy-ensure)
- `visibility: public`, `isDefault: true`
- v1: do not allow deleting the last remaining channel; prefer soft-block delete of `isDefault` unless another channel exists (finalize in TASKS)

---

[← E2E flows](./E2E-FLOWS.md) · [API routes →](./API-ROUTES.md)
