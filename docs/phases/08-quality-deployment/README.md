# Phase 8 — Quality, performance & deployment

**Status:** Frontend tests ✅ (Jest + React Testing Library). Other Phase 8 items follow this doc.  
**Prev:** [← Phase 7](../07-ai-integrations/README.md) · **Deploy lock:** [docs/architecture/deploy.md](../../architecture/deploy.md)

---

## 1. What this phase is for

Before Sameward feels “real,” we need three things:

1. **Tests** — important flows don’t break quietly  
2. **Performance** — pages stay snappy as features grow  
3. **Deploy** — push to GitHub → app runs live on **Railway**

We already chose **Railway** for production (not Vercel). Socket.IO needs a server that stays online; Railway fits that. Details: [deploy.md](../../architecture/deploy.md).

---

## 2. What you will build

- Tests for critical **frontend** user flows (Jest + React Testing Library) — **done** (components, forms, validation, user interactions, API loading/error states). No backend test suite.
- Light performance work (lazy routes, sensible images, memo only when needed)
- GitHub as the source of truth for code
- **Railway:** two services from one repo  
  - **web** — Next.js (UI + REST `app/api`)  
  - **realtime** — Socket.IO (`server/realtime`)
- Env vars set in Railway (Mongo, auth, email, S3, realtime URLs/secrets)
- Optional: CI that runs lint / typecheck / tests on each PR

---

## 3. How deploy works

```text
You push code to GitHub
        │
        ▼
Railway builds & runs two services
        │
        ├─ web (Next.js)     → https://your-app…
        │     UI pages + REST APIs
        │
        └─ realtime (Socket.IO) → wss://your-realtime…
              live messages, typing, presence

Both talk to MongoDB Atlas.
Uploads use AWS S3. Email uses Resend. Login can use Google.
Secrets live in Railway’s env settings — never in git.
```

Full picture and folder rules: [deploy.md](../../architecture/deploy.md)  
Auth env checklist: [auth/PRODUCTION.md](../../auth/PRODUCTION.md)

---

## 4. Why these tools

| Tool | Why we use it |
|------|----------------|
| Jest + RTL | Test what the user sees and does |
| GitHub | Code history, PRs, team review |
| **Railway** | Always-on host for Next **and** Socket.IO (our locked choice) |

We are **not** deploying the production Sameward app on Vercel. Vercel’s serverless model is a poor fit for long-lived WebSockets. Railway keeps both processes alive on one platform.

---

## 5. Concepts to learn

- [ ] Unit vs integration tests (what to mock, what not to)
- [ ] Mocking fetch / RTK Query in tests
- [ ] Code splitting / `dynamic` import when a page is heavy
- [ ] Env vars per environment (local vs Railway prod)
- [ ] How you’d roll back a bad deploy (redeploy previous commit)

---

## 6. Suggested folders

```text
__tests__/  or  **/*.test.tsx next to features
.github/workflows/ci.yml   # optional — lint, typecheck, test on PR
```

---

## 7. Backend notes (Mongo + Railway)

- Use a production MongoDB Atlas cluster (or equivalent)
- Connection pooling is handled by our `connectDB` cache — don’t open a new connection per request blindly
- Never commit `.env` files; copy names from `.env.example` into Railway

---

## 8. Micro-tasks

Mentor assigns near the end of the project. You can connect the GitHub remote earlier for backup (see [progress](../../tracking/progress.md)).

---

## 9. Before you call it “shipped”

- [ ] `npm run typecheck` and `npm run lint` pass  
- [x] Critical **frontend** tests pass (Jest + React Testing Library)
- [ ] Railway **web** and **realtime** both healthy  
- [ ] Smoke: signup/login, open a channel, send a message, see it live on a second browser  
- [ ] Smoke: verify/reset email links use the production `APP_URL`

---

## 10. Interview questions (preview)

1. What do you test with RTL, and what do you leave alone?  
2. Walk through deploy: PR → GitHub → Railway (web + realtime).  
3. Where do secrets live, and why not in the repo?  
4. Why Railway instead of serverless for Socket.IO?

---

## 11. Definition of done

- App is live from **GitHub → Railway** (Next web + Socket.IO realtime)  
- Core **frontend** flows have Jest + React Testing Library tests (not backend tests)
- You can explain the architecture end-to-end in an interview  

---

[Docs hub](../../README.md) · [Deploy topology](../../architecture/deploy.md)
