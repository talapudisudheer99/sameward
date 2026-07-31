# Production checklist — Auth

> Configure this before auth works on a live host.  
> Actual deploy (Vercel project, CI, domain) is **Phase 8**.

Also see root [`.env.example`](../../.env.example).

---

## 1. Never commit secrets

| Do | Don't |
|----|-------|
| `.env.local` locally; host env UI in production | Commit `.env`, keys, passwords |
| Copy names from `.env.example` | Paste real secrets into git |

`.gitignore` ignores `.env*` but allow-lists `.env.example`.

---

## 2. Environment variables

| Variable | Required for | Notes |
|----------|--------------|--------|
| `MONGODB_URI` | All auth | Atlas URI |
| `APP_URL` | Verify / reset emails | Public origin, e.g. `https://your-domain.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth | Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Server only |
| `GOOGLE_REDIRECT_URI` | Google OAuth | Exact match: `https://…/api/auth/google/callback` |
| `RESEND_API_KEY` | Email | Resend dashboard |
| `EMAIL_FROM` | Email | Verified sender |

`NODE_ENV=production` (set by host) → session cookies use `secure: true`.

No separate `AUTH_SECRET` today — session tokens are random bytes hashed in Mongo.

---

## 3. External services

### MongoDB Atlas
- [ ] Network access allows the host (or learning `0.0.0.0/0`)
- [ ] Strong DB user; URI uses it
- [ ] App `dbName: "teamhub"`

### Google OAuth
- [ ] Web client; redirect URI matches `GOOGLE_REDIRECT_URI`
- [ ] Prefer separate OAuth clients for local vs prod

### Resend
- [ ] Domain / sender verified for production `EMAIL_FROM`
- [ ] Smoke-test verify + reset emails

### HTTPS / cookies
- [ ] HTTPS live
- [ ] Cookie: HttpOnly, Secure, SameSite=Lax

---

## 4. Smoke tests after deploy

1. Signup → cookie → `/workspace`  
2. Verify link uses production `APP_URL`  
3. Wrong password → `AuthEvent` `signin.failure`  
4. Google → `/workspace`  
5. Forgot / reset on production domain  
6. Logout / logout-all  

---

## 5. Known limits

- In-memory rate limits are per instance (not Redis)
- No CAPTCHA / lockout emails / AuthEvent admin UI yet

---

[← Auth docs](./README.md) · [Phase 8](../phases/08-quality-deployment/README.md)
