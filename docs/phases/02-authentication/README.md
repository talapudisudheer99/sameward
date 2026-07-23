# Phase 2 — Authentication

**Status:** ⬜ Not started  
**Prev:** [← Phase 1](../01-product-shell/README.md) · **Next:** [Phase 3 — Workspaces →](../03-workspaces-members/README.md)

---

## 1. Business requirement

Only signed-in users access TeamHub workspaces. Roles control who can invite, delete, or admin.

## 2. What you will build

- Sign up / login / logout UI
- Session via **HTTP-only cookies**
- Next.js **Middleware** for protected routes
- Role checks (owner / admin / member) at API + UI

## 3. Architecture

```
Login form (Client)
  → POST /api/auth/login (Route Handler)
  → Verify credentials (MongoDB users — may start here or Phase 3)
  → Set httpOnly cookie
  → Middleware gates /app/*
  → UI reads session (server) for personalization
```

**Security rule:** UI hiding is not security. APIs must authorize.

## 4. Why these technologies

| Approach | Why | Trade-off |
|----------|-----|-----------|
| Cookies (httpOnly) | Safer than localStorage JWT for XSS | CSRF considerations to learn |
| Middleware | Early reject unauthenticated navigations | Not a substitute for API auth |
| Own auth in Next | Deep learning of sessions | More work than “Supabase Auth only” |

## 5. Concepts covered

- [ ] Cookies & sessions
- [ ] Middleware matchers
- [ ] Protected routes
- [ ] RBAC
- [ ] Password hashing concepts
- [ ] OAuth optional stretch (GitHub)

## 6. Folder structure (target)

```
app/api/auth/[...]/route.ts   # or discrete login/logout/register
middleware.ts
lib/auth/
```

## 7. Backend (Next + MongoDB)

- `users` collection (email, passwordHash, name, ...)
- Auth Route Handlers
- Session strategy documented in this phase’s notes as we implement

## 8. Micro-tasks

Mentor assigns after Phase 1.

## 9. Testing & production notes

- Never log secrets
- Secure cookie flags in production
- Test unauthorized API access returns 401/403

## 10. Interview questions (preview)

1. localStorage JWT vs httpOnly cookie — trade-offs?
2. What does middleware protect and what does it not?
3. Explain RBAC with an example endpoint.

## 11. Definition of done

Unauthenticated users cannot use `/app` or secured APIs; you can explain the full auth flow.

---

[Docs hub](../../README.md)
