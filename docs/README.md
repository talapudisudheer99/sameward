# TeamHub AI — Learning Documentation

> **Purpose of this repo:** deeply learn modern frontend architecture by building a real SaaS collaboration platform — not to rush a portfolio clone.

This `docs/` folder is the **source of truth** for:

- What we are building
- Why each phase exists
- How frontend + Next.js backend + MongoDB connect
- Where we are on the roadmap
- How to navigate feature guides

---

## Quick navigation

| Section | Path | Use when |
|--------|------|----------|
| **This hub** | [docs/README.md](./README.md) | Start here every session |
| **Product vision** | [architecture/product-vision.md](./architecture/product-vision.md) | “What is TeamHub AI?” |
| **Tech stack** | [architecture/stack.md](./architecture/stack.md) | “Why this technology?” |
| **Concept map** | [architecture/concept-dependency-map.md](./architecture/concept-dependency-map.md) | “What must I know before X?” |
| **Data flow** | [architecture/data-flow.md](./architecture/data-flow.md) | “How does a request travel?” |
| **Progress tracker** | [tracking/progress.md](./tracking/progress.md) | “Where are we right now?” |
| **Interview bank** | [tracking/interview-questions.md](./tracking/interview-questions.md) | Prep & review |
| **Design system** | [design/design-system.md](./design/design-system.md) | Colors, type, layout, tokens |
| **How we work** | [MENTORSHIP.md](./MENTORSHIP.md) | You = functionality; mentor = UI polish |
| **Phases 0–8** | [phases/](./phases/) | Feature-by-feature learning guides |
| **Feature index** | [features/README.md](./features/README.md) | Jump to a product feature |

---

## What we are building

**TeamHub AI** is a modern SaaS collaboration platform inspired by ideas from Slack, Notion, Jira, Trello, and LinkedIn — **without cloning them**.

Each feature exists to teach a production frontend concept:

| Product area | Real business purpose | Concepts unlocked |
|--------------|----------------------|-------------------|
| Landing + app shell | Onboard users into a workspace | Next.js layouts, routing, composition |
| Auth & roles | Secure multi-user access | Sessions, cookies, middleware, RBAC |
| Workspaces & members | Multi-tenant SaaS core | MongoDB models, relationships, CRUD APIs |
| Channels / docs / boards | Day-to-day collaboration | Forms, lists, optimistic UI, caching |
| Chat & presence | Live team communication | Socket.IO, rooms, cleanup |
| AI assist | Smart summaries / drafts | Third-party APIs, streaming, cost/safety |
| Billing (later) | Monetization path | Stripe test mode, webhooks |

Full vision: [architecture/product-vision.md](./architecture/product-vision.md)

---

## Architecture at a glance

```
React UI (Client / Server Components)
        ↓
TypeScript contracts
        ↓
Redux Toolkit (UI / client state)
        ↓
RTK Query (server-state cache)
        ↓
Next.js Route Handlers  ←── our backend API
        ↓
MongoDB (persistence)
        ↓
Response → cache update → re-render
        ↓
Tests (Jest + RTL) → Deploy (Vercel + GitHub)
```

Realtime path (later):

```
Client ←→ Socket.IO ←→ Next.js custom server / separate socket service
                ↓
         MongoDB (optional persistence of messages)
```

Details: [architecture/data-flow.md](./architecture/data-flow.md)

---

## Learning phases (0–8)

Status legend: `⬜ Not started` · `🔄 In progress` · `✅ Done`

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| **0** | [phases/00-foundation](./phases/00-foundation/README.md) | Scaffold, RSC vs Client, Tailwind/shadcn | 🔄 In progress |
| **1** | [phases/01-product-shell](./phases/01-product-shell/README.md) | Landing + authenticated app shell | ⬜ |
| **2** | [phases/02-authentication](./phases/02-authentication/README.md) | Auth, sessions, middleware, RBAC | ⬜ |
| **3** | [phases/03-workspaces-members](./phases/03-workspaces-members/README.md) | MongoDB + workspace CRUD APIs | ⬜ |
| **4** | [phases/04-state-data-layer](./phases/04-state-data-layer/README.md) | Redux Toolkit + RTK Query | ⬜ |
| **5** | [phases/05-collaboration-core](./phases/05-collaboration-core/README.md) | Channels, docs, boards | ⬜ |
| **6** | [phases/06-realtime](./phases/06-realtime/README.md) | Socket.IO chat, presence, typing | ⬜ |
| **7** | [phases/07-ai-integrations](./phases/07-ai-integrations/README.md) | AI + external services | ⬜ |
| **8** | [phases/08-quality-deployment](./phases/08-quality-deployment/README.md) | Testing, performance, GitHub → Vercel | ⬜ |

Update statuses in [tracking/progress.md](./tracking/progress.md) as we go.

---

## How to navigate a phase guide

Every phase folder follows the same template:

1. **Business requirement** — why the product needs this
2. **What you will build** — concrete UI + API outcomes
3. **Architecture** — how React → API → MongoDB connects
4. **Why these technologies** — trade-offs
5. **Concepts covered** — checklist for interviews
6. **Folder structure** — where code will live
7. **Backend (Next + MongoDB)** — routes, collections, validation
8. **Micro-tasks** — implement one task at a time with your mentor
9. **Testing & production notes**
10. **Interview questions**
11. **Prev / Next** links

**Rule:** Do not skip phases. Each layer depends on the one above it.

---

## Mentorship rules (reminder)

- Mentor explains and reviews — **you implement**
- **One micro-task at a time**
- Mistakes are teaching moments — we don’t silently rewrite everything
- Goal = production judgment + interview clarity, not speed

---

## GitHub & deployment (target end state)

1. Push this repo to **GitHub** (source of truth for code + `docs/`)
2. Connect **Vercel** to the GitHub repo for continuous deploys
3. Use env vars on Vercel for MongoDB URI, auth secrets, API keys
4. Keep `docs/tracking/progress.md` updated so collaborators (and future-you) know status

Phase 8 owns the full deploy checklist. We can push to GitHub earlier for backup — see [tracking/progress.md](./tracking/progress.md).

---

## Start here today

1. Read [architecture/product-vision.md](./architecture/product-vision.md)
2. Skim [architecture/stack.md](./architecture/stack.md)
3. Open **Phase 0**: [phases/00-foundation/README.md](./phases/00-foundation/README.md)
4. Continue mentor Task 1 (scaffold comprehension) before writing features
