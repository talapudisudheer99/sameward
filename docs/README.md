# TeamHub AI — Documentation

Learning docs for TeamHub AI.  
**Auth is complete** — for login help, start at [`auth/`](./auth/README.md).

These docs describe **what we have built**. Future ideas (docs/boards, AI V1.5, Redis multi-instance) are labeled clearly as **later** — not shipped.

---

## How this folder is organized

```text
docs/
  README.md          ← you are here
  MENTORSHIP.md      ← how we work with a mentor
  auth/              ← ✅ login, sessions, hardening
  workspaces/        ← ✅ workspaces & members
  channels/          ← ✅ channels, DMs, live chat, files, link previews
  ai/                ← ✅ Channel AI (Path A) + link reading
  profiles/          ← ✅ Profile v1
  settings/          ← ✅ Settings (theme, password, sessions)
  architecture/      ← product vision, stack, deploy, folders
  design/            ← design tokens
  guides/            ← tech notes (e.g. Mongoose)
  phases/            ← learning roadmap (0–8)
  features/          ← jump from feature name → doc
  tracking/          ← progress + interview questions
```

| Folder | What it covers |
|--------|----------------|
| **`auth/`** | Sign up, login, Google, sessions, hardening, production checklist |
| **`workspaces/`** | Create workspaces, invites, members, roles |
| **`channels/`** | Channels, DMs, messages, files, sockets, link previews |
| **`ai/`** | Summarize, Catch up, Ask, Explain, Draft, Notes + link context |
| **`profiles/`** | Edit your profile · teammate card |
| **`settings/`** | Theme, password, device sessions |
| **`architecture/`** | Vision, stack, Railway deploy, folder rules |
| **`phases/`** | Learning phases 0–8 |
| **`tracking/`** | Where we are on the roadmap |

---

## Start here

| Goal | Open |
|------|------|
| “How does login work?” | [auth/README.md](./auth/README.md) |
| “Workspaces & members?” | [workspaces/README.md](./workspaces/README.md) |
| “Channels & live chat?” | [channels/README.md](./channels/README.md) |
| “AI assistant?” | [ai/README.md](./ai/README.md) |
| “Profiles?” | [profiles/README.md](./profiles/README.md) |
| “Settings?” | [settings/README.md](./settings/README.md) |
| “Where do we deploy?” | [architecture/deploy.md](./architecture/deploy.md) — **Railway** (Next + Socket.IO) |
| “What’s next?” | [Phase 8](./phases/08-quality-deployment/README.md) — tests + live Railway deploy |
| “Where are we?” | [tracking/progress.md](./tracking/progress.md) |
| “What is TeamHub?” | [architecture/product-vision.md](./architecture/product-vision.md) |
| Mentorship rules | [MENTORSHIP.md](./MENTORSHIP.md) |

---

## Learning phases (0–8)

| Phase | Focus | Status |
|-------|--------|--------|
| [0 Foundation](./phases/00-foundation/README.md) | Scaffold, layouts, theme | ✅ Done |
| [1 Product shell](./phases/01-product-shell/README.md) | Landing + app shell | ✅ Done |
| [2 Authentication](./phases/02-authentication/README.md) | Sessions, OAuth, hardening | ✅ Done → [auth/](./auth/README.md) |
| [3 Workspaces](./phases/03-workspaces-members/README.md) | Multi-tenant CRUD | ✅ Done → [workspaces/](./workspaces/README.md) |
| [4 State](./phases/04-state-data-layer/README.md) | Redux + RTK Query | ✅ In use (workspaces, channels, AI, profiles, settings) |
| [5 Collaboration](./phases/05-collaboration-core/README.md) | Channels first; docs/boards later | ✅ Chat done → [channels/](./channels/README.md) |
| [6 Realtime](./phases/06-realtime/README.md) | Socket.IO for chat | ✅ Done → [channels/SOCKETS.md](./channels/SOCKETS.md) |
| [7 AI](./phases/07-ai-integrations/README.md) | Path A knowledge assistant | ✅ Done → [ai/](./ai/README.md) |
| [8 Quality & deploy](./phases/08-quality-deployment/README.md) | Tests + Railway live ship | ⬜ **Next** |

Also shipped outside the phase numbers: **Profiles**, **Settings**, **Explore demo**, **link previews**, **AI link-context**.

---

## Mentorship reminder

- You implement; mentor explains and reviews  
- One small task at a time  
- Prefer [auth/](./auth/README.md) when revisiting login  

---

## Secrets & deploy

- Env template: [`.env.example`](../.env.example)  
- Auth go-live checklist: [auth/PRODUCTION.md](./auth/PRODUCTION.md)  
- How we ship: [Phase 8](./phases/08-quality-deployment/README.md) · [deploy.md](./architecture/deploy.md) (**Railway** — web + realtime)
