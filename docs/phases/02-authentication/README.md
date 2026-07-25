# Phase 2 — Authentication

**Status:** 🔜 Next (Phase 1 complete — UI/shell)  
**Prev:** [← Phase 1](../01-product-shell/README.md) · **Next:** [Phase 3 — Workspaces →](../03-workspaces-members/README.md)

**Full step-by-step plan:** [E2E-FLOW.md](./E2E-FLOW.md)

---

## 1. Business requirement

Only signed-in users access TeamHub workspaces. Auth is the gate to the product.

## 2. What you will build

- Wire existing `/signup` + `/login` forms to real APIs
- Password hashing
- HTTP-only session cookies
- MongoDB `users` (+ `sessions`)
- `middleware.ts` protecting `/workspace`
- Logout

Google OAuth = stretch after email/password.

## 3. Architecture

```
Form → Zod → Route Handler → MongoDB → Set-Cookie
         ↑
    middleware checks cookie on /workspace
```

## 4. Why these technologies

| Choice | Why |
|--------|-----|
| httpOnly cookie | Safer than localStorage JWT for XSS |
| Middleware | Fast redirect for pages |
| Hash on server | Never store plain passwords |
| Shared Zod schemas | Same rules client + API |

## 5. Concepts covered

- [ ] Cookies & sessions
- [ ] Password hashing
- [ ] Middleware matchers
- [ ] Protected routes
- [ ] Defense in depth (middleware + API)
- [ ] OAuth (stretch)

## 6. Definition of done

See [E2E-FLOW.md](./E2E-FLOW.md) — signup/login/logout + protected `/workspace` + interview-ready explanation.

---

[Docs hub](../../README.md)
