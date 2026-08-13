# Tech Stack — Decisions & Trade-offs

## Frontend

| Technology | Role | Why we use it | Why not alternatives |
|------------|------|---------------|----------------------|
| **React 19** | UI library | Industry standard, component model, hooks | Vanilla DOM is too low-level for SaaS UI |
| **TypeScript** | Type safety | Contracts between UI ↔ API ↔ DB | Plain JS scales poorly in teams |
| **Next.js App Router** | Framework | Routing, RSC, layouts, Route Handlers, `proxy.ts` edge gate | CRA is deprecated; Vite SPA alone lacks full-stack patterns we need to learn |
| **Tailwind CSS** | Styling | Utility-first, fast iteration, design tokens | Heavy CSS modules alone slower for learning velocity |
| **shadcn/ui** | Accessible primitives | Own the code (not a black-box npm UI kit) | MUI/Chakra hide too much; reinventing a11y is costly |

## State

| Technology | Role | Why |
|------------|------|-----|
| **Redux Toolkit** | Client / UI state | Predictable global state, DevTools, interview relevance |
| **RTK Query** | Server state cache | Caching, invalidation, mutations — replaces ad-hoc Axios sprawl |

**Rule of thumb:**

- Server data (users, workspaces, messages history) → **RTK Query**
- Ephemeral UI (sidebar open, modal, selected tab) → **Redux slice** or local state
- Don’t put everything in Redux “because senior engineers use Redux”

## Backend (inside this repo)

| Technology | Role | Why |
|------------|------|-----|
| **Next.js Route Handlers** (`app/api/**`) | REST API | Same deploy unit as frontend; teaches full-stack Next |
| **MongoDB** | Database | Flexible documents for nested collaboration data; common in Node stacks |
| **Zod** | Request / form validation | Never trust client input — used on auth, workspaces, channels, AI, uploads |

### MongoDB vs the original Supabase/Postgres idea

Earlier planning mentioned Supabase (Postgres). We are documenting **MongoDB** as the persistence layer for this learning path because:

- Document model maps cleanly to nested workspace → channel → message shapes
- You practice Mongoose/native driver patterns common in interviews
- Auth can be owned in-app (sessions/JWT) rather than only vendor auth

**Trade-off:** You lose built-in Supabase Auth/Realtime — we replace those with our own auth + Socket.IO (intentional learning).

## Auth (Phase 2)

| Concern | Approach we’ll teach |
|---------|----------------------|
| Identity | Credentials / OAuth (e.g. GitHub) as needed |
| Session | HTTP-only cookies |
| Route protection | Next.js Middleware |
| Authorization | Role-based access (owner / admin / member) |

## Realtime (Channels module — Phase 5+6 merged)

| Technology | Role |
|------------|------|
| **Socket.IO** (separate Node service) | Live messages, typing, presence |
| **REST (Next Route Handlers)** | Channels CRUD, message history, uploads |

HTTP is source of truth; sockets fan out after successful writes.  
Spec: [`docs/channels/SOCKETS.md`](../channels/SOCKETS.md).

## Testing & deploy

| Technology | Role |
|------------|------|
| **Jest + React Testing Library** | Unit / integration of UI behavior |
| **GitHub** | Source control + collaboration |
| **Railway** | Always-on host: Next (UI+REST) + Socket.IO (`server/realtime`) |
| **MongoDB Atlas** | Database |
| **AWS S3** | Message file storage |

**Topology + folder boundaries:** [deploy.md](./deploy.md) (Option B — Railway for Next + Socket.IO).  
We do **not** use Vercel for the production TeamHub app (WebSockets need an always-on server).

## Third-party (what we actually use)

| Service | Role |
|---------|------|
| **OpenAI** | Channel AI (Path A) |
| **Resend** | Auth emails |
| **Google OAuth** | Sign in with Google |
| **AWS S3** | Chat attachments |
| **MongoDB Atlas** | Database |

Always ask before adding more: *What problem does buying this solve that we shouldn’t build?*

---

[← Product vision](./product-vision.md) · [Docs hub](../README.md) · [Deploy](./deploy.md) · [Folder structure](./folder-structure.md) · [Concept map →](./concept-dependency-map.md)
