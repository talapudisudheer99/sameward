# Phase 2 — Authentication

**Status:** ✅ Done (core + hardening F1–F7)  
**Prev:** [← Phase 1](../01-product-shell/README.md) · **Next:** [Phase 3 — Workspaces →](../03-workspaces-members/README.md)

---

## Where to read (source of truth)

All auth reference docs live in **[`docs/auth/`](../../auth/README.md)** — flows, API routes, frontend, lib/models, hardening, production, debugging.

Do **not** look for old mentoring drafts under this folder; they were merged into `docs/auth/`.

---

## What this phase delivered

- Email signup / signin / logout with DB sessions (httpOnly cookie)
- Google OAuth (same session mechanism)
- Forgot / reset password (Resend)
- Soft email verification
- Hardening: defense in depth, rate limits, logout-all, remember-me, audit, production checklist

---

## Concepts (interview)

- [x] httpOnly cookies & hashed sessions  
- [x] Password hashing  
- [x] Proxy as a gate (not full authz)  
- [x] Defense in depth (`requireUser`)  
- [x] OAuth code + state  
- [x] Soft vs hard email gates  

---

[Docs hub](../../README.md) · [Auth reference](../../auth/README.md)
