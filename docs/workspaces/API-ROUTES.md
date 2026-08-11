# API routes — Workspaces & members

Base: `/api/workspaces`  
All routes below require session via `getCurrentUser()` unless noted.  
Proxy does **not** protect `/api/*`.

| Method | Path | Who | Purpose | Status |
|--------|------|-----|---------|--------|
| GET | `/api/workspaces` | logged-in | List my workspaces | ✅ |
| POST | `/api/workspaces` | logged-in | Create + owner membership | ✅ |
| GET | `/api/workspaces/[workspaceId]` | member | Get one + my role | ✅ |
| PATCH | `/api/workspaces/[workspaceId]` | owner \| admin | Update name (+ slug) + description | ✅ |
| DELETE | `/api/workspaces/[workspaceId]` | **owner** | Delete + cascade invites & memberships | ✅ |
| GET | `/api/workspaces/[workspaceId]/members` | member | List members | ✅ |
| POST | `/api/workspaces/[workspaceId]/members` | owner \| admin + **emailVerified** | Send invites (existing users) | ✅ |
| DELETE | `/api/workspaces/[workspaceId]/members/me` | member | Leave (block sole owner) | ✅ |
| DELETE | `/api/workspaces/[workspaceId]/members/[userId]` | owner \| admin | Remove member | ✅ |
| PATCH | `/api/workspaces/[workspaceId]/members/[userId]` | **owner** | Role `member` \| `admin` | ✅ |
| GET | `/api/invites/[token]` | optional session | Preview pending invite | ✅ |
| POST | `/api/invites/[token]` | logged-in, email match | Accept → membership | ✅ |

**Audit:** successful mutations call `logWorkspaceEvent` (see [SECURITY.md](./SECURITY.md)). No audit on GET / validation 400s.

---

## Request / response (shipped)

### `POST /api/workspaces` ✅

**Body:** `{ "name": "Acme Product", "description?": "Eng team for mobile" }` (name 2–50 · description ≤280 optional)  
**201:** `{ id, name, slug, description, role: "owner" }`  
**400** validation · **401** unauthenticated  
**Audit:** `workspace.created`

### `GET /api/workspaces` ✅

**200:** `{ workspaces: [{ id, name, slug, description, role }, ...] }`

### `GET /api/workspaces/[workspaceId]` ✅

**200:** `{ id, name, slug, description, role }`  
**404** non-member / missing / bad id (same message)

### `PATCH /api/workspaces/[workspaceId]` ✅

**Body:** `{ "name": "…", "description?": "…" }`  
**200:** `{ id, name, slug, description, role }`  
**403** not owner/admin · **404** not a member  
**Audit:** `workspace.renamed`  
Slug regenerated via `slugifyUnique(name, workspaceId)` (excludes self). Description trimmed (empty clears).

### `DELETE /api/workspaces/[workspaceId]` ✅

**200:** `{ ok: true }`  
Deletes pending invites → all memberships → workspace. **No email notify.**  
**403** not owner · **404** not a member  
**Audit:** `workspace.deleted`

### `GET /api/workspaces/[workspaceId]/members` ✅

**200:** `{ members: [{ userId, fullName, email, role, avatarUrl }, ...] }`  
**404** if caller is not a member

`avatarUrl` is a short-lived presigned GET when the user uploaded a photo; otherwise `null` (UI shows initials).

### `POST /api/workspaces/[workspaceId]/members` ✅

**Body:** `{ "emails": ["a@company.com", …] }`  
**200:**

```json
{
  "invited": [{ "email", "inviteId" }],
  "failed": [{ "email", "reason": "not_found" | "already_member" | "invite_failed" | "email_send_failed" }]
}
```

Does **not** create `Membership`. Creates `WorkspaceInvite` + Resend email.  
**403** role or unverified · **404** not a member  
**Audit:** `invite.sent` per successful invite

### `DELETE /api/workspaces/[workspaceId]/members/me` ✅

**200:** `{ ok: true }`  
**400** sole owner · **404** not a member  
**Audit:** `member.left`

### `DELETE /api/workspaces/[workspaceId]/members/[userId]` ✅

**200:** `{ ok: true }`  
**400** self (use leave) · **403** not owner/admin or target is owner · **404**  
**Audit:** `member.removed` (`targetUserId`)

### `PATCH /api/workspaces/[workspaceId]/members/[userId]` ✅

**Body:** `{ "role": "member" | "admin" }`  
**200:** `{ userId, role }`  
**403** caller not owner, or target is owner · **404**  
**Audit:** `member.role_changed` (`reason` = new role)

### `GET /api/invites/[token]` ✅

**200:** `{ email, workspaceId, workspaceName, expiresAt, status: "pending" }`  
**404** missing · **410** expired or already accepted  
Login not required to preview.

### `POST /api/invites/[token]` ✅

**200:** `{ workspaceId, role }`  
Creates membership if needed (`member` default); sets `acceptedAt`; may set `emailVerified: true`  
**401** · **403** wrong email · **404/410**  
**Audit:** `invite.accepted`

---

## Authz matrix (API)

| Action | Check |
|--------|--------|
| List / get / get members | Membership exists |
| Send invites | owner \| admin + `emailVerified` |
| Accept invite | Session email === invite email |
| Leave | Membership; sole owner → 400 |
| Remove member | owner \| admin; not self; not owner target |
| Change role | **owner** only; target not owner; role ∈ { member, admin } |
| Rename | owner \| admin |
| Delete workspace | **owner** only; cascade; no notify |

---

## Status

All routes in the table above are implemented. Keep this file aligned with code.

---

[← Data model](./DATA-MODEL.md) · [Frontend →](./FRONTEND.md)
