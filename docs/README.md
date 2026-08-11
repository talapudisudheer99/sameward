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
  workspaces/        ← ✅ Phase 3 workspaces
  channels/          ← ✅ channels + realtime chat
  ai/                ← ✅ Phase 7 AI knowledge assistant
  profiles/          ← ✅ Profile v1
  architecture/      ← product vision, stack, data flow
  design/            ← design system tokens (+ marketing image prompts)
  guides/            ← reusable tech notes (e.g. Mongoose)
  phases/            ← roadmap stubs (what to build next)
  features/          ← feature → phase/doc index
  tracking/          ← progress + interview bank
```

| Folder | Purpose |
|--------|---------|
| **`auth/`** | Completed auth — flows, routes, FE, hardening, prod, debug |
| **`workspaces/`** | Phase 3 module — vision, stories, flows, tasks |
| **`channels/`** | Channels + realtime chat (Phase 5+6 merged) |
| **`ai/`** | Phase 7 Path A — AI knowledge assistant |
| **`profiles/`** | Profile v1 — edit self + teammate card |
| **`architecture/`** | Vision, stack, **folder structure**, data flow |
| **`phases/`** | Learning roadmap stubs |
| **`guides/`** | Tech primers (Mongoose, …) |
| **`tracking/`** | Where we are + interview Qs |
| **`design/`** | UI tokens |
| **`features/`** | Jump from product feature name → doc |

---

## Start here

| Goal | Open |
|------|------|
| “How does auth work?” | [auth/README.md](./auth/README.md) |
| “Workspaces & members?” | [workspaces/README.md](./workspaces/README.md) |
| “Channels & live chat?” | [channels/README.md](./channels/README.md) |
| “AI assistant?” | [ai/README.md](./ai/README.md) |
| “Member profiles?” | [profiles/README.md](./profiles/README.md) |
| “Next feature to build?” | [profiles/TASKS.md](./profiles/TASKS.md) · then [Phase 8](./phases/08-quality-deployment/README.md) |
| “Where do files go?” | [architecture/folder-structure.md](./architecture/folder-structure.md) |
| “Where are we on the roadmap?” | [tracking/progress.md](./tracking/progress.md) |
| “Landing image prompts?” | [design/marketing-image-prompts.md](./design/marketing-image-prompts.md) |
| “What is TeamHub?” | [architecture/product-vision.md](./architecture/product-vision.md) |
| “Why this stack?” | [architecture/stack.md](./architecture/stack.md) |
| “Where do we deploy?” | [architecture/deploy.md](./architecture/deploy.md) — **Railway** Option B (Next + Socket.IO, separate folders) |
| Mentorship rules | [MENTORSHIP.md](./MENTORSHIP.md) |

---

## Learning phases (0–8)

| Phase | Focus | Status |
|-------|--------|--------|
| [0 Foundation](./phases/00-foundation/README.md) | Scaffold, RSC, theme | ✅ |
| [1 Product shell](./phases/01-product-shell/README.md) | Landing + app shell | ✅ |
| [2 Authentication](./phases/02-authentication/README.md) | Sessions, OAuth, hardening | ✅ → [auth/](./auth/README.md) |
| [3 Workspaces](./phases/03-workspaces-members/README.md) | Multi-tenant CRUD | ✅ v1 → [workspaces/](./workspaces/README.md) |
| [4 State](./phases/04-state-data-layer/README.md) | Redux + RTK Query | 🟡 Partial (used in workspaces) |
| [5 Collaboration](./phases/05-collaboration-core/README.md) | Channels first; docs/boards later | ✅ → [channels/](./channels/README.md) |
| [6 Realtime](./phases/06-realtime/README.md) | Chat sockets folded into channels | ✅ → [channels/SOCKETS.md](./channels/SOCKETS.md) |
| [7 AI](./phases/07-ai-integrations/README.md) | Path A knowledge assistant | ✅ E2E → [ai/](./ai/README.md) |
| [8 Quality & deploy](./phases/08-quality-deployment/README.md) | Tests + Railway Option B | ⬜ **next** |

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
- Full ship pipeline: [Phase 8](./phases/08-quality-deployment/README.md) · [deploy.md](./architecture/deploy.md) (Railway Option B) 
