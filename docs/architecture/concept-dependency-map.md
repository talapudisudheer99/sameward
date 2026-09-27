# Concept Dependency Map

These layers depend on each other. Each layer assumes the one above.

```
JavaScript fundamentals
        ↓
TypeScript (types as contracts)
        ↓
React (components, hooks, render / reconciliation)
        ↓
Next.js App Router (layouts, RSC vs Client, routing)
        ↓
Tailwind + shadcn (design system composition)
        ↓
Next.js Route Handlers (REST API boundary)
        ↓
MongoDB (persistence, indexes, relationships-as-refs)
        ↓
Auth (cookies, sessions, `proxy.ts`, `requireUser` / `getCurrentUser`, workspace roles)
        ↓
Redux Toolkit (client / UI global state)
        ↓
RTK Query (server cache on top of APIs)
        ↓
Socket.IO (realtime beside REST)
        ↓
Release checks (TypeScript, ESLint, end-to-end)
        ↓
Performance → GitHub → Railway
```

## How to use this map

| If you are stuck on… | Go back to… |
|----------------------|-------------|
| Why is my Redux store empty on refresh? | RSC vs Client + where Provider lives |
| Why does RTK Query refetch forever? | Cache tags / invalidation / HTTP semantics |
| Why can any user hit my API? | Auth cookies + `proxy.ts` + route `getCurrentUser` checks |
| Why don’t live messages appear? | HTTP vs WebSocket; rooms; who emits |
| Why is Mongo returning weird shapes? | Schema design + TypeScript DTOs |

## Phase ↔ concept mapping

| Phase | Primary concepts |
|-------|------------------|
| 0 | Next layout tree, RSC defaults, Tailwind/shadcn |
| 1 | Nested layouts, composition, responsive shell |
| 2 | Cookies, sessions, middleware, protected routes |
| 3 | MongoDB models, CRUD Route Handlers, validation |
| 4 | configureStore, slices, RTK Query endpoints |
| 5 | Forms, lists, pagination, optimistic updates |
| 6 | Sockets, rooms, presence, cleanup |
| 7 | External APIs, secrets, failure modes |
| 8 | Tests, bundle/perf, CI deploy |

---

[← Stack](./stack.md) · [Docs hub](../README.md) · [Data flow →](./data-flow.md)
