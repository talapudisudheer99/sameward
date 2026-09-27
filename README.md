# Sameward

**A workspace where teams chat, share files and get AI help, all in one place.**

Live at **[sameward.com](https://sameward.com)** · Built and maintained by [Sudheer Talapudi](https://sudheer-talapudi.vercel.app)

Sameward is a production web app I designed, built and launched on my own: a Next.js web app and a separate Socket.IO realtime service, backed by MongoDB and deployed on Railway.

---

## Features

- **Workspaces and roles:** create or join a workspace, invite teammates by link, and manage members with `owner`, `admin` and `member` roles.
- **Channels and direct messages:** realtime chat with typing indicators, presence, read state, @mentions, emoji and link previews.
- **File sharing:** attachments and avatars uploaded straight to AWS S3 with presigned URLs.
- **Channel AI:** an assistant that summarizes a channel, catches you up, answers questions from the conversation and drafts replies. It never posts on its own; you review the draft and send it yourself.
- **Profiles:** a light professional profile (title, bio, avatar) shown as a teammate card.
- **Accounts and security:** email and Google sign-in, email verification, password reset, session management and "log out of all devices".

## Architecture

```text
Browser
  ├─ HTTPS ─► Next.js (web)        pages + REST API in app/api  ─► MongoDB Atlas
  │              │                                              ─► AWS S3, Resend, Google OAuth, OpenAI
  │              │ POST /internal/emit (shared secret)
  │              ▼
  └─ WSS ───► Socket.IO (realtime)  server/realtime  ─► MongoDB (membership checks)
```

- **REST is the source of truth.** Every write (a message, an edit, an upload) goes through a Next.js Route Handler, which validates it, checks permissions and saves it to MongoDB.
- **The realtime service only broadcasts.** After a write, the web service notifies the realtime service over a single internal endpoint protected by a shared secret, and the realtime service pushes the update to connected clients.
- **Sockets are authorized too.** The realtime service re-checks workspace and channel membership every time a client joins a room.
- **Two services, one repo.** Web and realtime run as separate Railway services with their own start commands, so the realtime service can move to another host by changing environment variables only.

More detail: [docs/architecture](./docs/architecture/data-flow.md) and [deploy notes](./docs/architecture/deploy.md).

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| State and data | Redux Toolkit, RTK Query, Axios |
| Forms and validation | React Hook Form, Zod |
| Backend | Next.js Route Handlers, Node.js, Mongoose, MongoDB Atlas |
| Realtime | Socket.IO (standalone Node.js service) |
| Auth | HttpOnly cookie sessions, bcrypt, SHA-256-hashed tokens, Google OAuth |
| AI | OpenAI API |
| Files and email | AWS S3 (presigned uploads), Resend |
| Deploy | Railway (two services: `web` and `realtime`) |

## Project structure

```text
app/              Next.js App Router: marketing, auth, app screens and REST API (app/api)
components/       UI components
hooks/            Custom React hooks
lib/              Shared code used by both services: auth, models, schemas, channel access
server/realtime/  Socket.IO service (its own entry point)
store/            Redux store and RTK Query APIs
docs/             Feature and architecture documentation
```

## Running locally

Requirements: Node.js 20+, a MongoDB database, and (optionally) AWS S3, Resend, Google OAuth and OpenAI keys for those features.

```bash
npm install
cp .env.example .env.local   # fill in the values; each one is explained in the file
npm run dev                  # web app on http://localhost:3000
npm run realtime             # realtime service, in a second terminal
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the Next.js web app |
| `npm run realtime` | Start the Socket.IO realtime service |
| `npm run build` / `npm start` | Production build and start (web) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier |

## Quality

Every release is type-checked and linted, and the main flows (sign-up and sign-in, workspace and invite, messaging and realtime, uploads, Channel AI) are tested manually end to end before deploying.

## Documentation

Each feature has its own folder in [`docs/`](./docs/README.md) covering user stories, API routes, data model, security and end-to-end flows:
[auth](./docs/auth/README.md) · [workspaces](./docs/workspaces/README.md) · [channels](./docs/channels/README.md) · [Channel AI](./docs/ai/README.md) · [profiles](./docs/profiles/README.md)

## License

© 2026 Sudheer Talapudi. All rights reserved. The code is public to read; please ask before reusing it.
