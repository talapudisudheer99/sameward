# Phase 3 — Workspaces & Members

**Status:** ✅ **v1 shipped + E2E verified** (deferred later items remain)  
**Prev:** [← Phase 2](../02-authentication/README.md) · **Next:** [Phase 4 — State & data →](../04-state-data-layer/README.md)

---

## Source of truth

All vision, stories, flows, tasks, and security rules live in:

**[`docs/workspaces/`](../../workspaces/README.md)**

Start with [VISION](../../workspaces/VISION.md) → [USER-STORIES](../../workspaces/USER-STORIES.md) → [TASKS](../../workspaces/TASKS.md).

Folder placement rules: [architecture/folder-structure.md](../../architecture/folder-structure.md).

---

## What v1 covers

- Create / list / get workspace · Screens A–D  
- Invite existing users → accept · Screen E · `/invite/[token]`  
- Leave · remove · rename · owner-delete (no notify)  
- Owner changes `member` ↔ `admin`  
- Tenant isolation (non-member → 404)  
- `WorkspaceEvent` audit (no UI)  

**Not in v1:** transfer ownership · invite non-users · delete notify · audit UI · channels/docs/boards  

---

## Concepts practiced

- [x] REST CRUD + status codes  
- [x] Zod validation shared FE/API  
- [x] Mongo refs + unique membership index  
- [x] Tenant isolation (membership checks)  
- [x] Thin handlers + `lib` helpers  
- [x] Consent-based invite + hashed tokens  
- [x] Best-effort tenant audit  

---

## Definition of done

See [workspaces/TASKS.md](../../workspaces/TASKS.md) — authenticated user can create/list workspaces, invite/accept members, leave/remove/rename/delete, change roles (owner), and APIs reject cross-tenant access.

---

[Docs hub](../../README.md) · [Workspaces module](../../workspaces/README.md)
