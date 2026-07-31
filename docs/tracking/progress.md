# Progress Tracker

> Update this file at the end of every mentoring session.

## Current position

| Field | Value |
|-------|--------|
| **Current phase** | Phase 3 — Workspaces & members |
| **Current feature** | **v1 shipped + E2E verified** — later: transfer ownership / non-user invites / audit UI |
| **Current technology** | Next.js App Router · Mongo/Mongoose · Zod · RTK Query · WorkspaceEvent audit |
| **Last updated** | 2026-07-31 |

## Phase status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation | ✅ Done | RSC, layouts, theme, hydration |
| 1 | Product shell | ✅ Done | Marketing, auth UI, workspace empty state |
| 2 | Authentication (core) | ✅ Done | Email/password, Google, forgot/reset, sessions, proxy |
| 2B | Auth hardening | ✅ Done | F1–F7 — [docs/auth](../auth/README.md) |
| 3 | Workspaces & members | ✅ **v1 shipped + E2E verified** | Create→invite→lifecycle→roles→audit — [`docs/workspaces/`](../workspaces/README.md). Deferred: transfer ownership, non-user invites, audit UI |
| 4 | State & data layer | 🟡 Partial | RTK Query already used for workspaces; Phase 4 can deepen |
| 5 | Collaboration core | ⬜ Not started | |
| 6 | Realtime | ⬜ Not started | |
| 7 | AI & integrations | ⬜ Not started | |
| 8 | Quality & deployment | ⬜ Not started | |

## Phase 3 v1 — what shipped

| Slice | Coverage |
|-------|----------|
| 1–4 | Models, create/list/get-one, Screens A–D, 404 isolation |
| 5 / 5b | Members list, chip invite, accept page, emailVerified gate |
| 3.5 | Leave, remove, rename, owner-delete (no notify) |
| 3.6 | Owner changes member ↔ admin after join |
| 7 | `WorkspaceEvent` audit on success mutations (no UI) |

**Not in v1:** non-user invites · transfer ownership · delete notify · audit UI · channels/docs/boards

## Auth hardening (F1–F7) — all done

See [auth/HARDENING.md](../auth/HARDENING.md).

## Completed concepts (auth + workspaces)

- httpOnly session cookies vs localStorage  
- Hash passwords; never store plaintext  
- Proxy as a **gate**, not full authz  
- OAuth code flow + `state`  
- Password reset / verify tokens (hash in DB, raw in email)  
- Soft email verification, rate limits, audit events, remember-me TTLs  
- Membership as tenant gate (workspace id ≠ entitlement)  
- Invite → accept (consent) vs instant-add  
- Best-effort tenant audit (`WorkspaceEvent`)  

## Interview questions covered

- Why Zod on client **and** server  
- httpOnly cookie vs JWT in localStorage  
- Why Google users may have no `passwordHash`  
- Why reset tokens are hashed at rest  
- Proxy vs `requireUser` (defense in depth)  
- Why invite-accept instead of instant membership  
- Why cross-tenant returns **404** not 403  

## Session log

| Date | What we did | Outcome |
|------|-------------|---------|
| 2026-07-27 | Forgot/reset password | Core auth |
| 2026-07-28 | Hardening F1–F7 | Auth production-shaped |
| 2026-07-28 | Docs refactor | Single source: `docs/auth/` |
| 2026-07-28 | Phase 3 module docs | `docs/workspaces/` vision → tasks |
| 2026-07-29 | Workspaces UI mockups approved | A–E |
| 2026-07-29 | **PO defaults locked** | Cross-tenant → **404**; existing users only; owner/admin invite |
| 2026-07-29–30 | Slices 1–4 | Models, create/list/get-one, RTK, Screens A–D |
| 2026-07-30 | Members + invite locks | Chips; invite→accept; inviter emailVerified |
| 2026-07-31 | Invite-accept demo ✅ | T21–T23 |
| 2026-07-31 | Lifecycle + roles ✅ | Leave/remove/rename/delete + role PATCH |
| 2026-07-31 | Workspace audit ✅ | T50–T51 wired |
| 2026-07-31 | Docs sync ✅ | `docs/workspaces/` = exact v1 inventory |
| 2026-07-31 | Full E2E verified by user | Ready to push |

## GitHub

| Item | Status |
|------|--------|
| Remote | ✅ `talapudisudheer99/teamhub-ai` |
| Branch | `learn/phase-0-foundation` |

---

[← Docs hub](../README.md) · [Auth reference →](../auth/README.md) · [Workspaces →](../workspaces/README.md)
