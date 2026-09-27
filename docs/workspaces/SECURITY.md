# Security — Workspaces (tenant isolation)

Non-negotiable for this module.

---

## Rules

1. **Session required** on every workspace API (`getCurrentUser`) — invite **preview** GET may be anonymous.
2. **Membership required** to read a workspace or its members.
3. **Role + verified required** for sending invites (`owner` | `admin` **and** `emailVerified`).
4. **No existence leak:** prefer **404** when the user is not a member (same as “not found”).
5. **Never** trust client-sent `ownerId` / `role` on create — server sets them.
6. **Unique membership** — cannot add the same user twice.
7. Proxy is **not** enough — `/api/workspaces` is outside the proxy matcher.
8. **No global user search / typeahead** for invites (v1) — avoids enumerating all accounts.
9. **UI is not authz** — hide Manage/Send invite / role controls where needed; API still returns **403**.
10. **Invite tokens** — store hash only; raw in email; single-use; expiry; accept only if session email matches invite email.
11. **Consent** — Membership is created on **accept**, never on send.
12. **Leave** — any member; sole owner → **400** (must delete or wait for transfer later).
13. **Remove** — owner \| admin; not self; cannot remove an **owner**.
14. **Role change** — **owner** only; target not owner; roles ∈ `{ member, admin }` only.
15. **Rename** — owner \| admin.
16. **Delete workspace** — **owner** only; cascade invites + memberships + workspace; **no** member email notify.
17. **Audit** — `WorkspaceEvent` on successful mutations; best-effort (`logWorkspaceEvent` never throws / never fails the request). No audit UI in v1.

---

## Threats we care about in Phase 3

| Threat | Mitigation |
|--------|------------|
| IDOR (guess workspace ObjectId) | Membership check → 404 |
| Privilege escalation (member invites) | Role check on POST members |
| Unverified inviter spam | Require `emailVerified` to send invites |
| Forced join without consent | Invite + accept; no instant Membership |
| Stolen / leaked invite URL | Expiry + single-use + email must match session |
| Orphan workspace (no owner) | Create workspace + owner membership together; block sole-owner leave |
| Listing everyone’s workspaces | Query only via `Membership` for current user |
| Email / user enumeration via typeahead | No “search all users” API |
| Batch invite ambiguity | Per-email `failed[]` / `invited[]` |
| Member promotes self to admin | Role PATCH is owner-only |
| Admin deletes workspace | DELETE workspace is owner-only |
| Admin removes owner | Target role `owner` → 403 |

---

## Soft email verify

Creating a workspace: allowed while unverified (auth soft gate).  
**Hard gate:** require `emailVerified` before **sending workspace invites**.

Client: central `useCurrentUser` from `GET /api/auth/me` so banner, Send invite CTA, and other gates share one source of truth.

---

## Workspace audit (shipped)

| Event | When |
|-------|------|
| `workspace.created` | POST create |
| `workspace.renamed` | PATCH rename |
| `workspace.deleted` | DELETE workspace |
| `invite.sent` | each successful invite |
| `invite.accepted` | POST accept |
| `member.left` | DELETE …/members/me |
| `member.removed` | DELETE …/members/[userId] |
| `member.role_changed` | PATCH role (`reason` = new role) |

Collection: `WorkspaceEvent` (`lib/models/workspace/workspace-event.ts`).  
Constants: `lib/workspaces/workspace-audit-events.ts`.  
Logger: `lib/workspaces/workspace-audit-logger.ts`.

---

## In one line

> “Multi-tenant security is membership checks on every workspace-scoped request. The workspace id in the URL is a claim we verify against the memberships collection — never an entitlement by itself.”

---

[← Tasks](./TASKS.md) · [Module index](./README.md)
