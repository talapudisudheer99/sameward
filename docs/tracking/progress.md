# Progress Tracker

> Update this file at the end of every mentoring session.

## Current position

| Field | Value |
|-------|--------|
| **Current phase** | Phase 2 — Auth hardening (2B) |
| **Current feature** | **F7 Production config checklist** (next) |
| **Current technology** | Deploy env / Secure cookies / OAuth URIs |
| **Last updated** | 2026-07-28 |

## Phase status

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation | ✅ Done | RSC, layouts, theme, hydration |
| 1 | Product shell | ✅ Done | Marketing, auth UI, workspace empty state |
| 2 | Authentication (core) | ✅ Done | Email/password, Google, forgot/reset, sessions, proxy |
| 2B | Auth hardening | 🔄 In progress | See `HARDENING.md` |
| 3 | Workspaces & members | ⬜ Not started | After 2B (or parallel by agreement) |
| 4 | State & data layer | ⬜ Not started | Redux + RTK Query |
| 5 | Collaboration core | ⬜ Not started | |
| 6 | Realtime | ⬜ Not started | |
| 7 | AI & integrations | ⬜ Not started | |
| 8 | Quality & deployment | ⬜ Not started | |

## Auth hardening backlog

| # | Feature | Status |
|---|---------|--------|
| F1 | Defense in depth (real session check) | ✅ Done |
| F2 | Email verification | ✅ Done (soft gate) |
| F3 | Rate limiting | ✅ Done |
| F4 | Log out all devices | ✅ Done |
| F5 | Remember me | ✅ Done |
| F6 | Audit / security logging | ✅ Done |
| F7 | Production config checklist | ⬜ |

## Completed concepts (auth)

- httpOnly session cookies vs localStorage  
- Hash passwords; never store plaintext  
- Proxy/middleware as a **gate**, not full authz  
- OAuth code flow + `state`  
- Password reset tokens (hash in DB, raw in email)  

## Interview questions covered

- Why Zod on client **and** server  
- httpOnly cookie vs JWT in localStorage  
- Why Google users may have no `passwordHash`  
- Why reset tokens are hashed at rest  

## Session log

| Date | What we did | Outcome |
|------|-------------|---------|
| 2026-07-27 | Forgot/reset password shipped + pushed | Core auth complete |
| 2026-07-27 | Agreed hardening backlog + roles | `HARDENING.md`; F1 flow next |
| 2026-07-28 | F1 requireUser + app layout | Fake cookie → login on refresh |

## GitHub

| Item | Status |
|------|--------|
| Remote | ✅ `talapudisudheer99/teamhub-ai` |
| Branch | `learn/phase-0-foundation` |
| Latest auth push | Forgot/reset password |

---

[← Docs hub](../README.md) · [Hardening plan →](../phases/02-authentication/HARDENING.md)
