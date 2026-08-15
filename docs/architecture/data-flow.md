# End-to-end data flow

How data moves through Sameward — in plain English.

## Read path (example: list workspaces)

```text
1. User opens workspaces
2. The page asks RTK Query for data
3. Browser calls GET /api/workspaces
4. Route Handler checks the session, then loads workspaces from MongoDB
5. JSON comes back
6. RTK Query caches it and the UI updates
```

## Write path (example: send a message)

```text
1. User hits Send in the composer
2. RTK mutation → POST /api/.../messages
3. Route Handler validates (Zod), writes MongoDB
4. Server notifies Socket.IO (internal emit)
5. Other members in the channel get message:new
6. Their RTK cache updates live — no full page reload
```

## Auth path (shipped — see docs/auth)

```text
Browser → POST /api/auth/signin
       → Set-Cookie (httpOnly session)
       → proxy.ts checks cookie presence on /workspace/*
       → app layout requireUser() re-checks the session in the database
       → APIs use getCurrentUser when needed
```

Full flows: [../auth/E2E-FLOWS.md](../auth/E2E-FLOWS.md)

## Realtime path (shipped)

```text
REST still owns saving history to MongoDB.
Socket.IO only announces after a successful write:

  Client joins channel room
  Server broadcasts message:new / typing / presence
  Other clients append to the RTK cache
```

Details: [../channels/SOCKETS.md](../channels/SOCKETS.md)

## Where each technology sits

| Layer | Technology |
|-------|------------|
| View | React + shadcn |
| Types | TypeScript |
| Client UI state | Redux Toolkit |
| Server data cache | RTK Query |
| API | Next.js Route Handlers |
| DB | MongoDB |
| Live | Socket.IO |
| Edge cookie check | `proxy.ts` |
| Tests (next) | Jest + RTL |
| Ship | GitHub + Railway |

## Common mistakes (bookmark this)

1. Fetching in every component with raw `fetch` and no cache strategy  
2. Putting server lists only in Redux slices instead of RTK Query  
3. Protecting pages in UI but leaving APIs open  
4. Using WebSockets for simple CRUD (skipping REST)  
5. Skipping TypeScript types on API responses  

---

[← Concept map](./concept-dependency-map.md) · [Docs hub](../README.md)
