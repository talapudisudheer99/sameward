# Phase 2 — Authentication: End-to-End Plan

**Status:** Ready to start (after Phase 1 push)  
**You build:** function (APIs, hashing, sessions, middleware wiring)  
**Mentor builds:** UI polish only if needed  
**Google OAuth:** after email/password works (same session cookie at the end)

---

## Business goal

| User | Must be able to | Must NOT |
|------|-----------------|----------|
| Visitor | Sign up, log in | Open `/workspace` or hit auth APIs as if logged in |
| Member | Stay logged in via cookie, log out | Access another user’s data |
| Later (Phase 3) | Own/create workspaces | — |

---

## End-to-end flows (product)

### A) Sign up

```text
/signup form (Zod already done)
  → POST /api/auth/signup
  → validate body with signupSchema
  → reject if email exists (409)
  → hash password (bcrypt/argon2)
  → insert user in MongoDB
  → create session → Set-Cookie (httpOnly)
  → redirect /workspace
```

### B) Log in

```text
/login form
  → POST /api/auth/login
  → validate loginSchema
  → find user by email
  → verify password hash
  → create session → Set-Cookie
  → redirect /workspace
```

### C) Browse protected app

```text
Request /workspace
  → middleware reads session cookie
  → invalid/missing → redirect /login?next=/workspace
  → valid → allow page
```

### D) Log out

```text
POST /api/auth/logout (or GET with care)
  → destroy session
  → clear cookie
  → redirect /
```

### E) Google (stretch, after A–D)

```text
Continue with Google
  → OAuth redirect
  → callback creates/finds user
  → SAME session cookie mechanism
  → /workspace
```

---

## Architecture (stack connection)

```text
React form (Client)
    ↓  fetch / RTK later
Next.js Route Handler  (/api/auth/*)
    ↓  Zod (shared schemas)
MongoDB users (+ sessions collection OR signed cookie)
    ↓  Set-Cookie: session=...; HttpOnly; Secure; SameSite
Browser stores cookie automatically
    ↓
middleware.ts on /workspace/*
    ↓
Page / API also re-checks session (defense in depth)
```

**Rule:** Middleware stops casual access. **APIs still verify session** — never trust UI alone.

---

## Data model (MongoDB — Phase 2 minimum)

### `users`

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | |
| `fullName` | string | |
| `email` | string | unique, lowercase |
| `passwordHash` | string | never store plain password |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### Sessions (pick one strategy — we choose in Step 1)

| Option | How | Pros |
|--------|-----|------|
| **A. DB sessions** | `sessions` collection: token → userId, expires | Revoke anytime |
| **B. Signed cookie** | JWT/sealed cookie with userId + exp | Less DB reads |

**Default for learning:** **A (DB sessions)** — clearer mental model for logout/revoke.

### `sessions` (if A)

| Field | Notes |
|-------|--------|
| `token` | random, hashed at rest (ideal) or opaque id |
| `userId` | ref users |
| `expiresAt` | TTL index |

---

## Target folders

```text
app/api/auth/signup/route.ts
app/api/auth/login/route.ts
app/api/auth/logout/route.ts
app/api/auth/me/route.ts          # optional: who am I?

middleware.ts

lib/db/mongoose.ts                 # connectDB() — Mongoose, dbName: teamhub
lib/auth/password.ts              # hash + verify
lib/auth/session.ts               # create / read / destroy
lib/auth/cookies.ts               # cookie name + options

lib/models/user.ts                # Mongoose User model
lib/models/session.ts             # Mongoose Session model

.env.local                        # MONGODB_URI, SESSION_SECRET, ...
```

Schemas (Zod request validation) already live in `lib/schemas/auth/`.

**ODM:** We use **Mongoose** (not the raw `mongodb` driver). See [MONGOOSE-GUIDE.md](./MONGOOSE-GUIDE.md).

---

## Step-by-step implementation order

Do **one step at a time**. Mentor reviews before the next.

| Step | You implement | Outcome |
|------|---------------|---------|
| **0** | Push Phase 1; skim this doc | Clean git baseline |
| **1** | Env + `connectDB()` in `lib/db/mongoose.ts` | `/api/health/db` pings |
| **2** | User model (`lib/models/user.ts`) | Can `User.create` |
| **3** | `password.ts` hash/verify helpers | No plain passwords |
| **4** | `POST /api/auth/signup` (no cookie yet) | Creates user, returns 201 |
| **5** | Session create + cookie helpers | Cookie set on response |
| **6** | Wire signup API into `/signup` form | Real register → cookie → `/workspace` |
| **7** | `POST /api/auth/login` + wire form | Login works |
| **8** | `middleware.ts` protect `/workspace` | Guests redirected to `/login` |
| **9** | Logout + “Log out” in sidebar | Session cleared |
| **10** | `GET /api/auth/me` + optional UI greeting | Prove session read |
| **11** *(stretch)* | Google OAuth | Same cookie after callback |
| **12** *(stretch)* | Email verification | Blocks unverified login |

**RBAC (owner/admin/member):** introduced lightly in Phase 2 (user exists), applied for real in **Phase 3** with workspaces/memberships.

---

## Security checklist (production habits)

- [ ] HttpOnly cookie (no `document.cookie` access to session)
- [ ] `Secure` in production (HTTPS)
- [ ] `SameSite=Lax` (or Strict where OK)
- [ ] Password hashed (bcrypt/argon2)
- [ ] Generic login error (“Invalid email or password”) — don’t leak which failed
- [ ] Rate limit mindset (later)
- [ ] Never log passwords
- [ ] Validate with Zod on **server** again (don’t trust client)

---

## What Phase 1 already gave us

- `/login`, `/signup` UI + Zod + RHF  
- `/workspace` shell  
- Marketing CTAs → auth routes  

Phase 2 **connects** those forms to a real backend.

---

## Definition of done (Phase 2)

1. Sign up creates a MongoDB user and sets a session cookie  
2. Log in works; bad credentials fail safely  
3. `/workspace` blocked without session  
4. Log out clears session  
5. You can whiteboard the full flow in an interview  

---

## First task when you return (Step 1)

After push:

1. Create MongoDB Atlas free cluster (or local Mongo)  
2. Add `MONGODB_URI` to `.env.local` (never commit)  
3. Implement `lib/db/mongodb.ts` connection helper  

Mentor will explain the connection pattern, then you code it.

---

[← Phase 2 overview](./README.md) · [Progress](../../tracking/progress.md)
