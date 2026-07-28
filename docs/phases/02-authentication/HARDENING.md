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
| **F3** | Rate limiting on auth APIs | Critical | — | ⬜ |
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

### F3 Rate limiting — preview

Limit attempts per IP (and maybe per email) on signup/signin/forgot/google start.

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
