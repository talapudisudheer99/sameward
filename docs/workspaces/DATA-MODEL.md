# Data model — Workspaces & members

## Collections

### `workspaces`

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | Display name (2–50 chars) |
| `slug` | string | URL-safe, unique |
| `ownerId` | ObjectId → User | Creator; billing/permissions root later |
| `createdAt` / `updatedAt` | dates | timestamps: true |

**v1 create/rename form:** only `name`. Slug derived server-side. No logo/industry yet.

### `memberships`

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId → Workspace | required, indexed |
| `userId` | ObjectId → User | required, indexed |
| `role` | enum | `owner` \| `admin` \| `member` |
| `createdAt` / `updatedAt` | dates | |

**Unique index:** `{ workspaceId: 1, userId: 1 }` — one membership per user per workspace.

### `workspaceinvites` (`WorkspaceInvite`)

| Field | Type | Notes |
|-------|------|--------|
| `workspaceId` | ObjectId | required, indexed |
| `email` | string | lowercase; invitee |
| `invitedBy` | ObjectId → User | who sent it |
| `tokenHash` | string | hash of raw token (raw only in email) |
| `expiresAt` | Date | 7 days |
| `acceptedAt` | Date \| null | null = pending |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** unique pending invite per `(workspaceId, email)` where pending; `tokenHash` unique.  
**Accept:** create `Membership` role `member`, set `acceptedAt`, optionally `User.emailVerified = true`.

### `workspaceevents` (`WorkspaceEvent`)

Append-only tenant audit (separate from `AuthEvent`).

| Field | Type | Notes |
|-------|------|--------|
| `event` | string | e.g. `workspace.created`, `member.removed` |
| `success` | boolean | required |
| `workspaceId` | ObjectId | tenant scope (indexed) |
| `actorUserId` | ObjectId | who acted |
| `targetUserId` | ObjectId | optional (remove / role change) |
| `email` | string | optional (invite.sent) |
| `reason` | string | optional (e.g. new role) |
| `createdAt` / `updatedAt` | dates | |

**Indexes:** `(workspaceId, createdAt)` · `createdAt` · `event`

---

## Roles (v1 meaning — shipped)

| Role | List/view | List members | Invite* | Remove | Leave | Change roles | Rename | Delete workspace |
|------|-----------|--------------|---------|--------|-------|--------------|--------|------------------|
| `owner` | yes | yes | yes | yes (not owners) | if not sole owner | **yes** (member ↔ admin) | yes | **yes** |
| `admin` | yes | yes | yes | yes (not owners) | yes | no | yes | no |
| `member` | yes | yes (read) | no | no | yes | no | no | no |

\* Invite also requires `emailVerified`.

Creator always gets `owner`. Invited users always join as `member`. Owner may later promote/demote to `admin`. **Transfer ownership** = not in v1.

**Delete locks:** no email notify; cascade pending invites + all memberships + workspace document.

---

## Relationship shape

```text
User 1 ──< Membership >── 1 Workspace
User / actions ──> WorkspaceEvent (audit)
Invite email ──> WorkspaceInvite ──(accept)──> Membership
```

Do **not** embed all members inside the workspace document for v1 — membership collection scales cleaner for “workspaces for this user.”

---

## Indexes (required)

- `workspaces.slug` — unique  
- `memberships.userId` — list my workspaces  
- `memberships.workspaceId` — list members of a workspace  
- `memberships` compound unique `(workspaceId, userId)`  
- `workspaceinvites.tokenHash` — unique  
- `workspaceevents` `(workspaceId, createdAt)`

---

[← E2E flows](./E2E-FLOWS.md) · [API routes →](./API-ROUTES.md)
