# Auth — developer reference

**Status:** Phase 2 + 2B complete (email/password, Google, hardening F1–F7)

This folder is the **single source of truth** for authentication.  
If you need to debug, extend, or explain auth in an interview — start here.

| Doc | Use when |
|-----|----------|
| [OVERVIEW.md](./OVERVIEW.md) | Mental model: cookies, sessions, layers of protection |
| [E2E-FLOWS.md](./E2E-FLOWS.md) | Step-by-step product flows (signup → logout-all, etc.) |
| [API-ROUTES.md](./API-ROUTES.md) | Every `/api/auth/*` route — method, purpose, audit events |
| [FRONTEND.md](./FRONTEND.md) | Pages, components, forms |
| [LIB-AND-MODELS.md](./LIB-AND-MODELS.md) | `lib/auth/*`, Mongoose models, Zod schemas |
| [HARDENING.md](./HARDENING.md) | F1–F7 what we built and why |
| [PRODUCTION.md](./PRODUCTION.md) | Env vars & deploy checklist (before Phase 8) |
| [DEBUGGING.md](./DEBUGGING.md) | Common failures and how to trace them |

**Related (not auth-specific):**
- Mongoose refresh: [../guides/mongoose.md](../guides/mongoose.md)
- Roadmap phase stub: [../phases/02-authentication/README.md](../phases/02-authentication/README.md)
- Progress: [../tracking/progress.md](../tracking/progress.md)

---

## Quick map (where is the code?)

```text
app/(auth)/                 # /login /signup /forgot-password /reset-password
app/(app)/                  # protected shell — requireUser() + verify banner
app/api/auth/               # all auth Route Handlers
lib/auth/                   # session, cookies, password, rate-limit, audit, email…
lib/models/                 # User, Session, tokens, AuthEvent
lib/schemas/auth/           # Zod — shared by forms + APIs
proxy.ts                    # cookie presence gate for /workspace/*
```

---

## Golden rules (don’t break these)

1. **Never store plaintext passwords** — only `passwordHash` (bcrypt).
2. **Never store raw session / reset / verify tokens** — store SHA-256 `tokenHash`.
3. **Proxy = cookie presence only** — real auth is `getCurrentUser` / `requireUser`.
4. **Audit logging is best-effort** — `logAuthEvent` must never break login.
5. **Client messages must not leak** whether an email exists (forgot-password).
6. **Comments in auth code are teaching notes** — keep them when editing.
