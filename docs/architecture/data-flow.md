# End-to-End Data Flow

This is the production mental model for TeamHub AI.

## Read path (example: list workspaces)

```
1. User opens /app/workspaces
2. React Client Component mounts (or Server Component fetches — phase-dependent)
3. RTK Query hook: useGetWorkspacesQuery()
4. HTTP GET /api/workspaces
5. Next.js Route Handler:
     - read session cookie
     - authorize user
     - query MongoDB (workspaces where user is member)
6. JSON response
7. RTK Query writes to cache
8. Redux store notifies subscribers
9. React re-renders list
10. (Later) tests assert loading / success / error UI
```

## Write path (example: create channel)

```
1. User submits form (controlled inputs)
2. RTK Query mutation: useCreateChannelMutation()
3. HTTP POST /api/workspaces/:id/channels
4. Route Handler validates body (Zod)
5. MongoDB insert
6. Response 201 + channel document
7. Cache invalidation / optimistic update
8. UI updates without full page reload
```

## Auth path (done — see docs/auth)

```
Browser → POST /api/auth/signin
       → Set-Cookie teamhub_session (httpOnly)
       → proxy.ts checks cookie presence on /workspace/*
       → app/(app)/layout requireUser() re-checks DB session
       → APIs use getCurrentUser when needed
```

Full flows: [../auth/E2E-FLOWS.md](../auth/E2E-FLOWS.md)

## Realtime path (Phase 6+)

```
REST still owns persistence for history
Socket.IO owns live events:

  Client joins room workspace:123
  Server broadcasts message:new
  Other clients append to local/RTK cache
```

## Where each technology sits

| Layer | Technology |
|-------|------------|
| View | React + shadcn |
| Types | TypeScript |
| Client state | Redux Toolkit |
| Server cache | RTK Query |
| API | Next.js Route Handlers |
| DB | MongoDB |
| Live | Socket.IO |
| Edge gate | Middleware |
| Proof | Jest + RTL |
| Ship | GitHub + Vercel |

## Common mistakes (bookmark this)

1. Fetching in every component with raw `fetch` and no cache strategy
2. Putting server lists only in Redux slices instead of RTK Query
3. Protecting pages in UI but leaving APIs open
4. Using WebSockets for simple CRUD
5. Skipping TypeScript types on API responses (“I’ll add types later”)

---

[← Concept map](./concept-dependency-map.md) · [Docs hub](../README.md)
