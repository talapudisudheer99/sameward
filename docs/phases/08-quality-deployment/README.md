# Phase 8 — Quality, Performance & Deployment

**Status:** ⬜ Not started  
**Prev:** [← Phase 7](../07-ai-integrations/README.md) · **Next:** — (iterate & deepen)

---

## 1. Business requirement

Production software must be **testable**, **fast enough**, and **shippable**. GitHub is the collaboration hub; Vercel ships Next.js.

## 2. What you will build

- Jest + React Testing Library for critical flows
- Performance passes: lazy routes, image hygiene, memo where justified
- GitHub repo hygiene + Vercel deploy with env vars
- Basic CI mindset (lint/typecheck/test on PR — stretch)

## 3. Architecture

```
Feature code
  → Unit/integration tests
  → git push GitHub
  → Railway: Next.js service (UI + REST)
  → Railway: Socket.IO service (server/realtime)
  → Env: MONGODB_URI, APP_URL, REALTIME URLs/secrets, Google/Resend/S3
     (see docs/auth/PRODUCTION.md + docs/architecture/deploy.md)
  → Production URL
```

**PO deploy lock (Option B):** [docs/architecture/deploy.md](../../architecture/deploy.md) — one platform, **two processes/folders**.

## 4. Why these technologies

| Tool | Why |
|------|-----|
| Jest + RTL | Test user behavior, not implementation trivia |
| Vercel | First-class Next hosting |
| GitHub | Industry default for code + PR review |

## 5. Concepts covered

- [ ] Unit vs integration tests
- [ ] Mocking fetch / RTK Query
- [ ] Code splitting / dynamic import
- [ ] Debounce / virtualization (as needed)
- [ ] Env configuration per environment
- [ ] Deployment rollback mindset

## 6. Folder structure (target)

```
__tests__/ or **/*.test.tsx beside features
.github/workflows/ci.yml   # optional stretch
```

## 7. Backend (Next + MongoDB)

- Production MongoDB Atlas (or similar)
- Connection pooling considerations
- Never commit `.env` secrets

## 8. Micro-tasks

Mentor assigns near the end — but we can **create the GitHub remote earlier** for backup (see progress tracker).

## 9. Testing & production notes

- `typecheck` + `lint` + tests green before merge
- Monitor bundle size regressions mentally as features grow

## 10. Interview questions (preview)

1. What do you test with RTL vs what you don’t?
2. Explain your deploy pipeline from PR to production.
3. How do you handle secrets in Vercel?

## 11. Definition of done

App deployed from GitHub → Vercel; core flows covered by tests; you can narrate architecture in an interview end-to-end.

---

[Docs hub](../../README.md)
