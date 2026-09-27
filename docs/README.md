# Sameward — Engineering Docs

Feature and architecture documentation for [Sameward](https://sameward.com).

These docs describe **what is built and running in production**. Future ideas (docs/boards, larger-history AI, multi-instance realtime) are clearly marked as **later**.

---

## How this folder is organized

```text
docs/
  README.md          ← you are here
  auth/              ← sign-up, login, sessions, hardening
  workspaces/        ← workspaces, invites, members, roles
  channels/          ← channels, DMs, live chat, files, link previews
  ai/                ← Channel AI + link reading
  profiles/          ← profiles and teammate card
  settings/          ← theme, password, device sessions
  architecture/      ← product vision, stack, deploy, folder structure
  design/            ← design system and tokens
  guides/            ← technical notes (e.g. Mongoose, support email)
  features/          ← jump from a feature name to its doc
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

Each feature folder follows the same layout: vision, user stories, API routes, data model, frontend, security and end-to-end flows.

---

## Start here

| Question | Open |
|------|------|
| “How does login work?” | [auth/README.md](./auth/README.md) |
| “Workspaces & members?” | [workspaces/README.md](./workspaces/README.md) |
| “Channels & live chat?” | [channels/README.md](./channels/README.md) |
| “AI assistant?” | [ai/README.md](./ai/README.md) |
| “Profiles?” | [profiles/README.md](./profiles/README.md) |
| “Settings?” | [settings/README.md](./settings/README.md) |
| “Where does it deploy?” | [architecture/deploy.md](./architecture/deploy.md) — **Railway** (Next + Socket.IO) |
| “What is Sameward?” | [architecture/product-vision.md](./architecture/product-vision.md) |

---

## Secrets & deploy

- Env template: [`.env.example`](../.env.example)  
- Auth go-live checklist: [auth/PRODUCTION.md](./auth/PRODUCTION.md)  
- Deploy: [deploy.md](./architecture/deploy.md) (**Railway** — web + realtime)
