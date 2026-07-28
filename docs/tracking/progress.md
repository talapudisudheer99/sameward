# Progress Tracker

> Update this file at the end of every mentoring session.

## Current position

| Field | Value |
|-------|--------|
| **Current phase** | Phase 3 — Workspaces & members (next) |
| **Current feature** | Auth complete — see [`docs/auth/`](../auth/README.md) |
| **Current technology** | — |
| **Last updated** | 2026-07-28 |

## Phase status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation | ✅ Done | RSC, layouts, theme, hydration |
| 1 | Product shell | ✅ Done | Marketing, auth UI, workspace empty state |
| 2 | Authentication (core) | ✅ Done | Email/password, Google, forgot/reset, sessions, proxy |
| 2B | Auth hardening | ✅ Done | F1–F7 — [docs/auth](../auth/README.md) |
| 3 | Workspaces & members | ⬜ Not started | Next |
| 4 | State & data layer | ⬜ Not started | Redux + RTK Query |
| 5 | Collaboration core | ⬜ Not started | |
| 6 | Realtime | ⬜ Not started | |
| 7 | AI & integrations | ⬜ Not started | |
| 8 | Quality & deployment | ⬜ Not started | |

## Auth hardening (F1–F7) — all done

See [auth/HARDENING.md](../auth/HARDENING.md).

## Completed concepts (auth)

- httpOnly session cookies vs localStorage  
- Hash passwords; never store plaintext  
- Proxy as a **gate**, not full authz  
- OAuth code flow + `state`  
- Password reset / verify tokens (hash in DB, raw in email)  
- Soft email verification, rate limits, audit events, remember-me TTLs  

## Interview questions covered

- Why Zod on client **and** server  
- httpOnly cookie vs JWT in localStorage  
- Why Google users may have no `passwordHash`  
- Why reset tokens are hashed at rest  
- Proxy vs `requireUser` (defense in depth)  

## Session log

| Date | What we did | Outcome |
|------|-------------|---------|
| 2026-07-27 | Forgot/reset password | Core auth |
| 2026-07-28 | Hardening F1–F7 | Auth production-shaped |
| 2026-07-28 | Docs refactor | Single source: `docs/auth/` |

## GitHub

| Item | Status |
|------|--------|
| Remote | ✅ `talapudisudheer99/teamhub-ai` |
| Branch | `learn/phase-0-foundation` |

---

[← Docs hub](../README.md) · [Auth reference →](../auth/README.md)
