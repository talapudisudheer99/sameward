# Lib & models — Workspaces (shipped)

Follow [folder-structure.md](../architecture/folder-structure.md).

## Layout (what exists)

```text
lib/models/workspace/
  workspace.ts                 # ✅
  membership.ts                # ✅ owner | admin | member
  workspace-invite.ts          # ✅ tokenHash, TTL, acceptedAt
  workspace-event.ts           # ✅ tenant audit

lib/schemas/workspace/
  workspace-schema.ts          # ✅ create/rename { name }
  add-member-schema.ts         # ✅ { emails: string[] }
  role-update-schema.ts        # ✅ { role: member | admin }

lib/workspaces/
  create-workspace.ts          # ✅ createWorkspaceForUser
  slugify.ts                   # ✅ slugify + slugifyUnique(name, excludeId?)
  invite.ts                    # ✅ token, URL, expiry, findPendingInviteByRawToken
  workspace-audit-events.ts    # ✅ event name constants
  workspace-audit-logger.ts    # ✅ logWorkspaceEvent (never throws)

store/api/workspaces-api.ts    # ✅ all workspace RTK endpoints
```

**Not built:** `require-membership.ts` helper (authz still inline in routes).

---

## Models

| Model | Notes |
|-------|--------|
| `Workspace` | name, unique slug, ownerId |
| `Membership` | unique `(workspaceId, userId)` · roles enum |
| `WorkspaceInvite` | tokenHash unique · pending unique `(workspaceId, email)` · TTL on expiresAt |
| `WorkspaceEvent` | append-only audit · indexes `(workspaceId, createdAt)` |

Hot-reload safe exports (same pattern as `User` / `AuthEvent`).

---

## Helpers

| Helper | Purpose |
|--------|---------|
| `createWorkspaceForUser` | Workspace + owner membership |
| `slugifyUnique` | Unique slug; optional `excludeId` on rename |
| `createInviteToken` / `buildInviteUrl` / `inviteExpiresAt` | Invite link (7d) |
| `findPendingInviteByRawToken` | Hash lookup + expired/accepted |
| `logWorkspaceEvent` | Best-effort Mongo + dev console |

---

## Audit events (wired on success)

`workspace.created` · `workspace.renamed` · `workspace.deleted` · `invite.sent` · `invite.accepted` · `member.left` · `member.removed` · `member.role_changed`

No audit UI in v1.

---

## Status

Lib/models match shipped APIs. Keep this file in sync when adding helpers.

---

[← Frontend](./FRONTEND.md) · [Tasks →](./TASKS.md)
