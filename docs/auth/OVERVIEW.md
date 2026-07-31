# Auth overview — mental model

## What “logged in” means here

1. Browser holds an httpOnly cookie: `teamhub_session` (raw random token).
2. Mongo `sessions` collection holds `tokenHash` + `userId` + `expiresAt`.
3. Every trusted check hashes the cookie and looks up the session + user.

```text
Browser cookie (raw token)
        ↓  hashToken (SHA-256)
Mongo Session.tokenHash  →  userId  →  User document
```

If the cookie is missing, fake, expired, or the session row was deleted → not logged in.

---

## Protection layers (defense in depth)

| Layer | File | What it does |
|-------|------|----------------|
| 1. Proxy | `proxy.ts` | On `/workspace/*`: redirect to `/login` if **no cookie**. No DB. |
| 2. App layout | `app/(app)/layout.tsx` → `requireUser()` | Real DB session check; redirect if invalid. Soft email-verify banner. |
| 3. APIs | Route Handlers | Sensitive actions use `getCurrentUser()` or tokens; never trust the UI alone. |

**Important:** Proxy does **not** prove the session is valid. A forged cookie can pass the proxy until `requireUser` / `getCurrentUser` runs.

---

## Features we shipped

| Area | Behavior |
|------|----------|
| Email signup | Create user → session cookie → optional verify email (soft gate) |
| Email signin | Password verify → session; **Remember me** → 1d vs 30d TTL |
| Google OAuth | Code flow + `state` cookie → same session cookie |
| Logout | Delete this session + clear cookie |
| Logout all | `deleteMany` sessions for user + clear cookie |
| Forgot / reset | Email link (hashed token); reset also kills all sessions |
| Email verify | Soft gate: banner + resend; does not block `/workspace` |
| Rate limits | In-memory fixed window on sensitive routes |
| Audit | `AuthEvent` in Mongo + JSON log in non-production |

**Not shipped (later):** RBAC roles, hard gate on invites, Redis rate limits, session device list UI, Vercel deploy (Phase 8).

---

## Session lifetimes

| Call | Lifetime |
|------|----------|
| Login, remember me **off** | 1 day |
| Login, remember me **on** | 30 days |
| Signup / Google (no flag) | 7 days |

Cookie `maxAge` and DB `expiresAt` always use the **same** seconds (`lib/auth/session.ts` + `cookies.ts`).

---

## Google vs password users

- Google-only users may have **no** `passwordHash`.
- Signin treats “no password” like invalid credentials (same message).
- Forgot-password can **set** a first password for Google-only users.
- Linking: existing email user can get `googleId` if Google email is verified.

---

## Interview one-liner

> “We use DB-backed sessions: raw token in an httpOnly cookie, hash in Mongo. Proxy only checks cookie presence; layouts and APIs call `getCurrentUser` for real auth. Hardening adds soft email verify, rate limits, logout-all, remember-me TTLs, and audit events.”
