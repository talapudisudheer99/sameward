# Channels & realtime chat — module reference

**Status:** Phase 5+6 merged — **docs locked, not built** (Jul 31, 2026)  
**Customer goal:** Inside a workspace, the team has a **place to talk live** — public and private channels, text + limited files, typing, and basic presence.

**PO locks (Jul 31, 2026)**
1. **Realtime:** separate **Socket.IO** service (not only REST; not sockets-only CRUD)
2. **Visibility:** **public + private** day one
3. **Default channel:** hybrid **`#general`** on workspace create + soft tip to create more
4. **Messages:** text + **files with hard limits** (types/size/count)
5. **Live UX:** **typing** + **basic presence** in v1
6. **Create channel:** **owner | admin** only

This folder is the **single source of truth** for the channels module (same idea as [`docs/auth/`](../auth/README.md) + [`docs/workspaces/`](../workspaces/README.md)).

| Doc | Use when |
|-----|----------|
| [VISION.md](./VISION.md) | Why + in/out of scope |
| [USER-STORIES.md](./USER-STORIES.md) | PO stories + acceptance |
| [E2E-FLOWS.md](./E2E-FLOWS.md) | Product + technical flows |
| [DATA-MODEL.md](./DATA-MODEL.md) | Collections + visibility |
| [API-ROUTES.md](./API-ROUTES.md) | Planned REST (history, channels, uploads) |
| [SOCKETS.md](./SOCKETS.md) | Separate Socket.IO service, events, edge cases |
| [FRONTEND.md](./FRONTEND.md) | Screens + composer + live list |
| [LIB-AND-MODELS.md](./LIB-AND-MODELS.md) | Planned `lib/` + `apps/realtime` (or `server/`) |
| [TASKS.md](./TASKS.md) | Slice checklist |
| [STEP-A-REALTIME-SCAFFOLD.md](./STEP-A-REALTIME-SCAFFOLD.md) | ✅ Second process + `/health` |
| [STEP-B-SOCKET-ATTACH.md](./STEP-B-SOCKET-ATTACH.md) | ✅ Socket.IO attach + smoke connect |
| [SECURITY.md](./SECURITY.md) | Tenant + channel membership + socket authz |
| [S3-SETUP.md](./S3-SETUP.md) | AWS account / bucket / IAM (like Google Console) |

---

## What v1 will cover (planned)

| Area | Covered |
|------|---------|
| Channels | Create (owner/admin) · list · open · rename/archive or delete (rules TBD in tasks) |
| Visibility | `public` (all workspace members) · `private` (channel members only) |
| Default | `#general` public on workspace create; lazy-create if missing |
| Messages | Persist via REST · live fan-out via Socket.IO |
| Files | Images + PDF · size/count/type limits (see VISION) |
| Live | Typing indicators · basic online presence |
| Safety | Workspace membership always · private → channel membership · non-access → **404** |

## What v1 will **not** cover (deferred)

- Threads / reply sidebars  
- DMs / group DMs  
- Message reactions (emoji in text OK)  
- Custom emoji packs  
- Announcement-only channels  
- Virus scanning / arbitrary file types  
- Docs / boards (separate later modules)  
- Full audit UI for chat  

---

## Architecture snapshot

```text
Next.js (App Router)          Socket.IO service (separate process)
  REST: channels, history,      Auth handshake (session)
  uploads, private invites      Rooms: workspace:*, channel:*
  RTK Query cache               Emit: message:new, typing, presence
           │                              │
           └──────── MongoDB ─────────────┘
```

**Golden rule:** Mongo is source of truth. Socket announces after a successful write.

---

## Golden rules

1. **Workspace membership** required for any channel API / socket join.
2. **Private channel** → also require **channel membership** (or owner/admin exception only if PO locks it — default: must be channel member).
3. **Create channel** = owner \| admin only.
4. **UI is not authz** — hide CTAs; API + socket still enforce.
5. **Separate realtime service** — do not rely on Vercel serverless alone for Socket.IO.

---

[← Docs hub](../README.md) · [Workspaces ←](../workspaces/README.md)
