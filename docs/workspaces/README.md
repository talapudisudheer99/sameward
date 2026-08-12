# Workspaces & members — module reference

**Status:** Phase 3 — **v1 product surface shipped** (docs synced Jul 31, 2026)  
**Customer goal:** After login, users get a **team home** with clear belonging and roles — not just an empty account.

**PO locks**
- Jul 30: invite → accept · existing users only · inviter `emailVerified` · chips / no typeahead  
- Jul 31: leave / remove / rename / owner-delete (no delete notify) · role change after join (owner only) · workspace audit  

This folder is the **single source of truth** for the workspaces module (same idea as [`docs/auth/`](../auth/README.md)).

| Doc | Use when |
|-----|----------|
| [VISION.md](./VISION.md) | Why + in/out of scope |
| [USER-STORIES.md](./USER-STORIES.md) | PO stories + acceptance |
| [E2E-FLOWS.md](./E2E-FLOWS.md) | Product + technical flows |
| [DATA-MODEL.md](./DATA-MODEL.md) | Collections + roles |
| [API-ROUTES.md](./API-ROUTES.md) | Shipped `/api/workspaces/*` + invites |
| [FRONTEND.md](./FRONTEND.md) | Screens A–E + invite page |
| [LIB-AND-MODELS.md](./LIB-AND-MODELS.md) | `lib/` paths that exist |
| [TASKS.md](./TASKS.md) | Slice checklist |
| [SECURITY.md](./SECURITY.md) | Tenant isolation + audit |

---

## What v1 covers (shipped)

| Area | Covered |
|------|---------|
| Workspace | Create, list mine, get one, rename, delete (owner, cascade) |
| Belonging | Membership + `owner` \| `admin` \| `member` |
| Invite | Existing users · chip emails · accept link · inviter verified |
| People | List members · leave · remove · promote/demote (owner) |
| Safety | Non-member → **404** · no typeahead |
| Audit | `WorkspaceEvent` on success paths (no UI viewer) |
| UI | Screens A–E · `/invite/[token]` · RTK · ConfirmDialog · OverflowText |

## What v1 does **not** cover (deferred)

- Invite emails with no TeamHub account  
- Role picker on invite  
- Transfer ownership  
- Notify members on delete  
- Audit UI / export  
- Docs / boards (channels = next module → [`docs/channels/`](../channels/README.md))  

---

## Quick map (code that exists)

```text
app/(app)/workspace/…                         # A/B list + D detail + E members
app/(invite)/invite/[token]/…                # Accept invite page
app/api/workspaces/…                          # Full CRUD-ish + members + leave/remove/role
app/api/invites/[token]/…                    # Preview + accept
lib/models/workspace/                         # workspace, membership, invite, event
lib/schemas/workspace/                        # create, add-member, role-update
lib/workspaces/                               # create, slugify, invite, audit
store/api/workspaces-api.ts                   # All RTK hooks for above
components/dialogs/workspace/                 # create, invite, rename
components/workspace/                         # list, members-table, display
components/invite/                            # accept-invite-card
components/dialogs/confirm-dialog.tsx         # Shared confirm
components/sharable/overflow-text.tsx         # Long-name UI
```

---

## Golden rules

1. **Every workspace access checks membership** — never trust `workspaceId` alone.
2. **Creator becomes owner** — create + owner membership together.
3. **Membership on accept only** — never on invite send.
4. **Thin Route Handlers** — validate → authorize → model/helper → JSON (+ best-effort audit).
5. **UI is not authz** — hide CTAs; API still enforces roles.

---

[← Docs hub](../README.md) · [Auth →](../auth/README.md)
