# TeamHub AI — Documentation

Learning docs for building a SaaS collaboration platform.  
**Auth is complete** — when debugging or extending login, start at [`auth/`](./auth/README.md).

---

## How this folder is organized

```text
docs/
  README.md          ← you are here (hub)
  MENTORSHIP.md      ← how we work
  auth/              ← ✅ completed auth (single source of truth)
  architecture/      ← product vision, stack, data flow
  design/            ← design system tokens
  guides/            ← reusable tech notes (e.g. Mongoose)
  phases/            ← roadmap stubs (what to build next)
  features/          ← feature → phase/doc index
  tracking/          ← progress + interview bank
```

| Folder | Purpose |
|--------|---------|
| **`auth/`** | Everything about authentication — flows, routes, FE, hardening, prod, debug |
| **`architecture/`** | Why the product/stack exists (not day-to-day feature how-tos) |
| **`phases/`** | Learning roadmap; each phase README points to real refs when done |
| **`guides/`** | Tech primers (Mongoose, …) |
| **`tracking/`** | Where we are + interview Qs |
| **`design/`** | UI tokens |
| **`features/`** | Jump from product feature name → doc |

---

## Start here

| Goal | Open |
|------|------|
| “How does auth work?” | [auth/README.md](./auth/README.md) |
| “Where are we on the roadmap?” | [tracking/progress.md](./tracking/progress.md) |
| “What is TeamHub?” | [architecture/product-vision.md](./architecture/product-vision.md) |
| “Why this stack?” | [architecture/stack.md](./architecture/stack.md) |
| “Next feature to build?” | [phases/03-workspaces-members](./phases/03-workspaces-members/README.md) |
| Mentorship rules | [MENTORSHIP.md](./MENTORSHIP.md) |

---

## Learning phases (0–8)

| Phase | Focus | Status |
|-------|--------|--------|
| [0 Foundation](./phases/00-foundation/README.md) | Scaffold, RSC, theme | ✅ |
| [1 Product shell](./phases/01-product-shell/README.md) | Landing + app shell | ✅ |
| [2 Authentication](./phases/02-authentication/README.md) | Sessions, OAuth, hardening | ✅ → [auth/](./auth/README.md) |
| [3 Workspaces](./phases/03-workspaces-members/README.md) | Multi-tenant CRUD | ⬜ Next |
| [4 State](./phases/04-state-data-layer/README.md) | Redux + RTK Query | ⬜ |
| [5 Collaboration](./phases/05-collaboration-core/README.md) | Channels, docs, boards | ⬜ |
| [6 Realtime](./phases/06-realtime/README.md) | Socket.IO | ⬜ |
| [7 AI](./phases/07-ai-integrations/README.md) | External AI APIs | ⬜ |
| [8 Quality & deploy](./phases/08-quality-deployment/README.md) | Tests, Vercel | ⬜ |

---

## Mentorship reminder

- You implement; mentor explains and reviews  
- One micro-task at a time  
- Keep teaching comments in code  
- Prefer [auth/](./auth/README.md) over reading every route file when revisiting auth  

---

## Secrets & deploy

- Template: [`.env.example`](../.env.example)  
- Auth production checklist: [auth/PRODUCTION.md](./auth/PRODUCTION.md)  
- Full ship pipeline: Phase 8  
