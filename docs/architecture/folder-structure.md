# Folder structure — TeamHub AI (full stack)

> **Why this doc exists:** Before shipping product features (workspaces, channels, …), we lock a **production-shaped** layout.  
> Interviews and future-you should answer: *Where does UI live? Where does the API live? Where does domain logic live?* — without hunting.

This is the **source of truth** for structure. Phase guides may show examples; if they conflict, **this file wins**.

---

## 1. Mental model (one sentence)

**Next.js App Router is the full stack:** `app/` = pages + API routes; `lib/` = server/shared logic; `components/` = UI; Mongo models and Zod schemas stay next to the domain they belong to.

```text
Browser UI (app pages + components)
        ↓  axios / later RTK Query
Route Handlers (app/api/**)
        ↓  Zod schemas (lib/schemas)
Domain helpers (lib/auth, lib/… later)
        ↓
Mongoose models (lib/models) + connectDB (lib/db)
        ↓
MongoDB Atlas (db: teamhub)
```

We do **not** invent a separate Express `src/server` folder. The “backend” is Route Handlers + `lib/`.

---

## 2. Top-level tree (locked)

```text
teamhub-ai/
├── app/                    # Next.js App Router (UI routes + API)
├── components/             # React UI (no DB, no secrets)
├── lib/                    # Shared + server logic, models, schemas
├── hooks/                  # Client hooks (when needed)
├── public/                 # Static assets
├── docs/                   # Learning + feature reference
├── proxy.ts                # Edge gate (cookie presence) — Next 16 name for middleware
├── .env.example            # Env names only (no secrets)
├── package.json
└── …
```

| Path | Owns | Does **not** own |
|------|------|------------------|
| `app/` | URLs, layouts, Route Handlers | Fat business logic (keep handlers thin) |
| `components/` | Rendering, forms, dialogs | Mongo / `process.env` secrets |
| `lib/` | Auth, DB, models, Zod, email, audit | JSX pages |
| `docs/` | How/why we built it | Runtime code |
| `proxy.ts` | Fast redirect if no session cookie | DB lookups |

---

## 3. `app/` — routes (FE pages + BE APIs)

### 3.1 Route groups (UI)

Parentheses = **layout grouping**, not URL segments.

```text
app/
├── layout.tsx                 # Root: fonts, theme, providers
├── (marketing)/               # Public marketing
│   ├── layout.tsx
│   └── page.tsx               # → /
├── (auth)/                    # Public auth pages
│   ├── layout.tsx
│   ├── login/page.tsx         # → /login
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
└── (app)/                     # Authenticated product shell
    ├── layout.tsx             # requireUser() + sidebar + verify banner
    └── workspace/
        └── page.tsx           # → /workspace
```

**Rules**
- Public vs authenticated shells stay in different route groups.
- Protected UI goes under `(app)/` so `requireUser()` runs once in the layout.
- New product areas: `(app)/workspace/...`, later `(app)/settings/...`, etc. — **URL mirrors product**, not “pages/api” style.

### 3.2 API routes (backend)

```text
app/api/
├── health/
│   └── db/route.ts            # Ops smoke check
├── auth/                      # Identity domain (done)
│   ├── signup/route.ts
│   ├── signin/route.ts
│   ├── logout/route.ts
│   ├── logout-all/route.ts
│   ├── me/route.ts
│   ├── google/route.ts
│   ├── google/callback/route.ts
│   ├── forgot-password/route.ts
│   ├── reset-password/route.ts
│   ├── verify-email/route.ts
│   └── resend-verification/route.ts
└── workspaces/                # Phase 3+ (example)
    ├── route.ts               # GET list / POST create
    └── [workspaceId]/
        ├── route.ts           # GET / PATCH / DELETE one
        └── members/route.ts   # membership actions
```

**Rules**
- One domain folder under `app/api/<domain>/`.
- Dynamic segments: `[workspaceId]`, `[channelId]` — never `id` alone if unclear.
- Handler file is always `route.ts` (Next convention).
- Keep handlers **orchestration-thin**: validate → call `lib` helper / model → return JSON.
- Auth for APIs: call `getCurrentUser()` (or domain authz) inside the handler — don’t rely on proxy alone (`/api/*` is not matched by our proxy).

---

## 4. `components/` — frontend UI

```text
components/
├── ui/                        # Design-system primitives (shadcn) — generic
├── forms/                     # Reusable form fields (RHF wrappers)
├── buttons/                   # Shared submit/cancel patterns
├── layout/                    # App chrome: sidebar, logout, banners, logo
├── marketing/                 # Landing / auth shell chrome
├── dialogs/                   # Modals grouped by domain
│   └── workspace/
├── sharable/                  # Tiny shared widgets (loader, …)
└── theme-provider.tsx
```

**Growth rule for features (Phase 3+)**

Prefer **domain folders** when a feature has several UI pieces:

```text
components/
  workspace/                   # list, card, empty state, settings panels
  members/                     # invite form, member row
  channels/                    # later
````

| Put here | Example |
|----------|---------|
| `ui/` | Button, Input, Dialog primitive |
| `layout/` | Sidebar used across the app |
| `dialogs/<domain>/` | Create workspace dialog |
| `components/<domain>/` | Feature-specific screens/widgets |
| **Not** in `components/` | `User.find`, `connectDB`, Resend keys |

**Naming:** kebab-case files (`logout-button.tsx`). Match existing style.

---

## 5. `lib/` — shared + backend brain

```text
lib/
├── db/
│   └── mongoose.ts            # connectDB (cached)
├── models/                    # Mongoose models (one file ≈ one collection)
│   ├── user.ts
│   ├── session.ts
│   ├── …auth tokens / AuthEvent
│   └── workspace.ts           # Phase 3+
├── schemas/                   # Zod — shared by forms + APIs
│   ├── auth/
│   └── workspace/
├── auth/                      # Auth domain services (done)
│   ├── session.ts
│   ├── cookies.ts
│   ├── password.ts
│   ├── require-user.ts
│   ├── rate-limit.ts
│   ├── audit.ts
│   └── email*.ts
├── api/
│   └── axios.ts               # Browser HTTP client
├── types/                     # Shared TS types (non-Zod) when needed
└── utils.ts                   # cn() and tiny pure helpers
```

**Rules**
- **Models** = persistence shape. **Schemas** = request/form validation. Both can exist for one domain.
- Domain helpers grow as folders: `lib/auth/*` today; later `lib/workspaces/*` (create, authorize membership) if handlers get fat.
- Do **not** put React components in `lib/`.
- Do **not** import `lib/models` from Client Components — keep DB on the server.

### Domain slice pattern (interview-friendly)

For each product domain (auth, workspaces, channels):

| Layer | Location |
|-------|----------|
| HTTP API | `app/api/<domain>/…/route.ts` |
| Validation | `lib/schemas/<domain>/` |
| Persistence | `lib/models/<name>.ts` |
| Business helpers | `lib/<domain>/` (when logic > ~40 lines in the route) |
| UI | `app/(app)/…` pages + `components/<domain>/` |

That is a **modular monolith** inside one Next app — production-common for SaaS learning apps.

---

## 6. Cross-cutting files

| File | Role |
|------|------|
| `proxy.ts` | Cookie presence on `/workspace/*` only; no Mongo |
| `lib/auth/require-user.ts` | Real session check in `(app)` layout |
| `docs/auth/` | Auth reference (flows, routes, hardening) |
| `.env.example` | Env contract; secrets stay in `.env.local` / host |

---

## 7. What we will **not** do (for now)

| Anti-pattern | Why we avoid it |
|--------------|-----------------|
| `pages/` router alongside App Router | Two routing systems |
| Separate `backend/` Express app | Extra deploy + loses Next learning goals |
| Dumping all components in one flat folder | Unfindable after 30 files |
| Business logic only inside `route.ts` forever | Unusable routes; hard to test |
| Client Components that import Mongoose | Bundle + security disaster |
| Feature folders that copy `node_modules` patterns (`controllers/`, `services/` everywhere on day one) | Ceremony without need — introduce `lib/<domain>/` when routes get fat |

---

## 8. Phase 3 example (workspaces) — follow this shape

When we build workspaces, default placement:

```text
app/(app)/workspace/…              # UI routes (list, detail later)
app/api/workspaces/route.ts
app/api/workspaces/[workspaceId]/route.ts
lib/models/workspace.ts
lib/models/membership.ts           # if separate collection
lib/schemas/workspace/…
components/dialogs/workspace/…
components/workspace/…             # as UI grows
```

Optional later: `lib/workspaces/create-workspace.ts` if create flow spans invites + audit + roles.

---

## 9. Interview talking points

Use these lines confidently:

1. **“Full-stack Next modular monolith”** — UI and API in one repo; domain folders under `app/api` and `lib`.
2. **“Route groups separate shells”** — marketing, auth, and authenticated app don’t share the wrong layout.
3. **“Thin handlers, fat lib”** — Route Handlers orchestrate; models/schemas/helpers own rules.
4. **“Zod at the boundary, Mongoose at the DB”** — two validation layers with different jobs.
5. **“Defense in depth”** — `proxy.ts` is a gate; `requireUser` / `getCurrentUser` are real authz checks.
6. **“Colocate by domain as we grow”** — `auth`, then `workspaces`, then `channels` — not by technical layer only (`all-services/`, `all-utils/`).

---

## 10. Checklist for every new feature

Before coding:

1. [ ] Which **domain** name? (`workspaces`, `members`, …)
2. [ ] API under `app/api/<domain>/`?
3. [ ] Zod under `lib/schemas/<domain>/`?
4. [ ] Model under `lib/models/`?
5. [ ] UI under `(app)/` + `components/<domain>/` or `dialogs/<domain>/`?
6. [ ] Need a `lib/<domain>/` helper, or is the route still thin?
7. [ ] Update `docs/` (feature note or phase) when behavior is non-obvious

---

[← Docs hub](../README.md) · [Stack](./stack.md) · [Auth reference](../auth/README.md) · [Phase 3](../phases/03-workspaces-members/README.md)
