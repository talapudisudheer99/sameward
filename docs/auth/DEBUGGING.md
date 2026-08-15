# Auth debugging guide

Use this when something “doesn’t work” before randomly editing routes.

---

## 1. Decide which layer failed

| Symptom | Check first |
|---------|-------------|
| Instant redirect to `/login` on `/workspace` | Cookie missing? → DevTools → Application → Cookies → `sameward_session` |
| Cookie present but still bounced to login | Session row missing/expired → Mongo `sessions`; or `requireUser` |
| API 401 Invalid credentials | Password / Google-only user / wrong email — check `AuthEvent` reason |
| API 429 | Rate limit — wait window or restart dev server (in-memory Map clears) |
| Email never arrives | Resend key, `EMAIL_FROM`, `APP_URL`; server logs “Verification email failed” |
| Google lands on `/login?error=…` | Read query param; check `google_oauth_state` + Console redirect URI |
| Banner never goes away after verify | Link used wrong host; or layout cache — hard refresh; confirm `emailVerified: true` on User |
| Other device still “in” after logout-all | They keep old cookie until **next request**; refresh `/workspace` |

---

## 2. Prove the session

```bash
# While logged in (browser will send cookie if same origin tools, or use DevTools Network)
GET /api/auth/me
```

- `200` + user → session is valid server-side  
- `401` → cookie/session problem (not UI)

Mongo:

```js
// sessions — tokenHash is SHA-256 of cookie value
db.sessions.find({ userId: ObjectId("...") })

// authevents — recent failures
db.authevents.find().sort({ createdAt: -1 }).limit(20)
```

---

## 3. Trace a request (mental checklist)

```text
Browser form
  → Zod (client) 
  → axios POST /api/auth/...
  → rateLimit?
  → Zod (server)
  → User / Session / Token models
  → logAuthEvent (best-effort)
  → Set-Cookie or JSON / redirect
```

If the client toast says one thing and Mongo has no `AuthEvent`, either:
- request never hit the server, or
- validation failed before the log call, or
- audit helper failed (check server `Failed to log auth event`)

---

## 4. Common footguns we already hit

| Issue | Fix / lesson |
|-------|----------------|
| Rate limit “does nothing” | Must `return` the 429 response |
| Soft gate became hard gate | Banner must not replace `{children}` |
| Verify URL wrong | Must be `/api/auth/verify-email`, not a missing page |
| Mongoose hot reload stripped fields | Clear cached model in dev (`user.ts`) |
| Remember-me only updated DB | Cookie `maxAge` must use same seconds |
| Audit `throw` broke login | Helper must catch and only `console.error` |
| Proxy vs auth | Cookie present ≠ valid session |

---

## 5. Safe change workflow

1. Read [E2E-FLOWS.md](./E2E-FLOWS.md) for the flow you’re touching  
2. Change **one** layer (API *or* UI *or* helper)  
3. Keep teaching comments  
4. Confirm matching audit event + cookie/session manually  
5. Run `npm run typecheck`

---

[← Auth docs](./README.md)
