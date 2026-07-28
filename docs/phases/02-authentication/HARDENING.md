# Phase 2B — Auth hardening (production gaps)

**Status:** In progress (after core auth + Google + forgot password)  
**Audience:** Learner + mentor  
**Rule:** Discuss end-to-end flow before writing code for each feature.

---

## Operating model

| Role (mentor) | Responsibility |
|---------------|----------------|
| Product owner | What we build, in what order, acceptance criteria |
| Tech lead | Assign one task at a time; review before next |
| Teacher | Why this feature, why this flow, explain code |
| BA | Keep this doc + progress tracker accurate |
| UI | Auth UI consistency (AuthShell, toasts, copy) |
| Interview coach | “How would you explain this in an interview?” |

| Role (you) | Responsibility |
|------------|----------------|
| Engineer | Implement the assigned task; ask when flow is unclear |
| Learner | Confirm you understand the flow before coding |

---

## Already shipped (Phase 2 core)

- [x] Signup / signin / logout / me  
- [x] Sessions (DB) + httpOnly cookie  
- [x] Proxy gate on `/workspace` (cookie **presence** only)  
- [x] Google OAuth + linking  
- [x] Forgot / reset password  

---

## Backlog — high priority (+ logout-all-devices)

Ordered for **learning + risk**. Do one feature at a time.

| # | Feature | Priority | Depends on | Status |
|---|---------|----------|------------|--------|
| **F1** | Defense in depth — real session check | Critical | Sessions exist | ✅ Done |
| **F2** | Email verification on signup | Critical | Resend | ✅ Done (soft gate) |
| **F3** | Rate limiting on auth APIs | Critical | — | ✅ Done |
| **F4** | Log out all devices | High | Sessions | ⬜ |
| **F5** | Remember me (wire or remove) | High | Sessions / cookies | ⬜ |
| **F6** | Audit / security logging | High | — | ⬜ |
| **F7** | Production config checklist | High | Deploy later | ⬜ |

### Why this order

1. **F1 first** — Interview classic: “middleware ≠ authorization.” Makes the app actually reject fake cookies. Small, foundational.  
2. **F2** — Real product trust; reuses Resend skills.  
3. **F3** — Protects login/forgot/signup from abuse once traffic exists.  
4. **F4** — Natural once you trust sessions; settings UI.  
5. **F5** — Small UX decision after session lifetime is clear.  
6. **F6** — Cross-cutting; easier once endpoints are stable.  
7. **F7** — Ops/docs when you deploy (domains, HTTPS, Google redirect URIs).

---

## F1 — Defense in depth (CURRENT — discuss before code)

### Business requirement

A visitor with **no valid session** must not see `/workspace` content — even if they forge a cookie named `teamhub_session`.

### Problem today

```text
Proxy:  cookie name exists? → allow page
Page:   may render without calling getCurrentUser()
Result: garbage cookie can still load the empty workspace UI
```

### Target flow

```text
Browser requests /workspace
  → Proxy: no cookie at all? → /login?next=/workspace   (fast reject)
  → App layout (Server Component): await getCurrentUser()
       → null? → redirect /login
       → user? → render children (sidebar, page)
Optional later: APIs also call getCurrentUser() / requireAuth()
```

### Acceptance criteria

- [ ] Logged-in user: `/workspace` works as today  
- [ ] Logged-out user: redirected to login (proxy + layout)  
- [ ] Fake cookie value: still redirected (layout catches what proxy misses)  
- [ ] You can explain in one minute: proxy vs `getCurrentUser`

### Out of scope for F1

- Email verification, rate limits, settings UI  

### Interview angle

> “Edge/proxy checks a cheap signal (cookie present). The app still verifies the session in the database before trusting the user. Never authorize from the client alone.”

---

## Later features (flow TBD when we start each)

### F2 Email verification — CURRENT (discuss before code)

#### Business requirement

After email/password signup, the user must prove they own the inbox before we treat the account as fully trusted. Stops typos and throwaway signups from looking “real.”

#### Product rules (PO)

1. **Email/password signup** → create user with `emailVerified: false` → create session (they can enter app) **OR** block until verified — we choose soft vs hard gate below.  
2. Send verification email with one-time link (same pattern as password reset).  
3. User clicks link → set `emailVerified: true` → go to `/workspace` or `/login`.  
4. **Google users** → `emailVerified: true` immediately (Google already verified).  
5. Resend: “Resend verification email” for unverified users.

#### Soft gate vs hard gate (decide with learner)

| Option | Behavior | Pros |
|--------|----------|------|
| **A Soft (recommended for learning)** | Allow `/workspace` but show a banner “Verify your email”; optional later lock on sensitive actions | Less friction; still teaches the flow |
| **B Hard** | `requireUser` also requires `emailVerified`; else `/verify-email` page | Stricter, more “production B2B” |

**Mentor default: A Soft for F2**, then we can tighten later if you want.

#### End-to-end flow (soft gate)

```text
1) POST /api/auth/signup
   - create user (emailVerified: false)
   - create email-verification token (hash in DB, raw in link)
   - send email via Resend
   - createSession → redirect /workspace
   - banner: verify your email

2) User clicks:
   /api/auth/verify-email?token=...
   (or /verify-email?token=... page that calls API)

3) Server:
   - hash token, find row, check expiry
   - set user.emailVerified = true
   - delete token
   - redirect /workspace (or login)

4) Google callback:
   - create/link user with emailVerified: true
   - no verification email
```

#### Why this flow (same as reset password)

| Piece | Role |
|-------|------|
| Token hash in DB | Don’t store raw secret |
| Raw token in email link | Proves inbox access |
| Expiry | Old links die |
| Google skip | Provider already verified email |

#### Out of scope for F2

Rate limiting, logout-all-devices, remember-me.

#### Interview angle

> “We never trust an unverified email for sensitive actions. Verification is a one-time token emailed to the address, hashed at rest — same pattern as password reset.”

---

### F3 Rate limiting — CURRENT (discuss before code)

#### Business requirement

Stop abuse of auth endpoints: password guessing, signup spam, and email bombing (forgot/resend).

#### Why this feature

Without limits, anyone can:

- Brute-force passwords on `/api/auth/signin`
- Flood Resend via forgot-password / resend-verification
- Create thousands of junk accounts via signup

#### PO decisions (TeamHub learning)

| Decision | Choice | Why |
|----------|--------|-----|
| Storage (now) | **In-memory Map** on the Node process | Simple to learn; no Redis yet |
| Storage (production later) | Redis / Upstash | Shared across serverless instances |
| Identity key | **IP address** (primary) | Works before we know the user |
| Extra key (login/forgot) | Optional: also limit by **email** | Stops one IP rotating emails / one email from many IPs |
| On limit hit | HTTP **429** + clear message | Standard; frontend can toast it |

#### Which routes to protect

| Route | Limit (starting point) | Why |
|-------|------------------------|-----|
| `POST /api/auth/signin` | 10 / 15 min / IP | Brute force |
| `POST /api/auth/signup` | 5 / hour / IP | Junk accounts |
| `POST /api/auth/forgot-password` | 5 / hour / IP | Email bombing |
| `POST /api/auth/resend-verification` | 5 / hour / IP | Email bombing |
| `GET /api/auth/google` | 20 / 15 min / IP | OAuth start spam |

**Do not rate-limit heavily (F3):**

- `logout`, `me` — authenticated, low abuse value  
- `verify-email` GET — token is unguessable; user must click email  
- `google/callback` — must complete OAuth; Google already throttles somewhat  
- `reset-password` — token is unguessable (optional light limit later)

#### End-to-end flow

```text
1) Request hits e.g. POST /api/auth/signin
2) First line in handler (after we can read IP):
     rateLimit({ key: `signin:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 })
3) If over limit → 429 { message: "Too many attempts. Try again later." }
4) If under limit → continue existing login logic
5) (Optional) count only failed logins later — F3 counts all attempts for simplicity
```

#### Helper shape (conceptual)

```ts
// lib/auth/rate-limit.ts
rateLimit({ key, limit, windowMs })
  → { ok: true }
  → { ok: false, retryAfterSeconds }
```

Each route calls it once at the top.

#### How we get IP in App Router

```ts
request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  ?? "unknown"
```

On localhost this may be `::1` / `127.0.0.1` — fine for learning.

#### Soft spots (teach in interview)

- In-memory resets when server restarts  
- Multiple Vercel instances each have their own Map → use Redis in production  
- Attackers can change IP (VPN) — limits reduce abuse, don’t eliminate it  

#### Interview angle

> “We rate-limit sensitive auth endpoints by IP with a fixed window. Learning env uses an in-memory store; production would use Redis so limits work across serverless instances. Clients get 429 when exceeded.”

#### Out of scope for F3

- CAPTCHA, account lockout emails, Redis setup, audit log DB (F6)

---

### F4 Log out all devices — preview

Settings: list sessions or one button → `Session.deleteMany({ userId })` → clear current cookie → login.

### F5 Remember me — preview

Checked → longer `maxAge` / session `expiresAt`; unchecked → shorter. Or remove checkbox if we keep one fixed lifetime.

### F6 Audit logging — preview

Structured logs (or `auth_events` collection) on fail/success for login, reset, OAuth.

### F7 Production config — preview

Checklist: Atlas IP/Vercel, `APP_URL`, Google redirect URIs, Resend domain, `NODE_ENV=production` Secure cookies.

---

## Session decisions

| Date | Decision |
|------|----------|
| 2026-07-27 | Do all high-priority hardening + logout-all-devices before treating auth as “production-shaped” |
| 2026-07-27 | Flow discussion mandatory before each new feature |
| 2026-07-27 | Start with **F1 Defense in depth** |
| 2026-07-28 | F1 done: `requireUser` + `app/(app)/layout.tsx` |
| 2026-07-28 | **F2 soft gate locked** — verify banner now; hard gates on invites later (Phase 3+) |

---

[← Phase 2 overview](./README.md) · [Progress](../../tracking/progress.md)
