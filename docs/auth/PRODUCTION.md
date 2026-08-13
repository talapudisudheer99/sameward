# Production checklist — Auth

> Set these up before auth works on a live host.  
> Putting the app online (Railway + domain + CI) is **Phase 8** — see [deploy.md](../architecture/deploy.md).

Also see root [`.env.example`](../../.env.example).

---

## 1. Never commit secrets

| Do | Don't |
|----|-------|
| Use `.env.local` on your laptop; use Railway’s env UI in production | Commit `.env`, API keys, or passwords |
| Copy **names** from `.env.example` | Paste real secrets into git |

`.gitignore` ignores `.env*` but keeps `.env.example`.

---

## 2. Environment variables

| Variable | Required for | Notes |
|----------|--------------|--------|
| `MONGODB_URI` | All auth | Atlas connection string |
| `APP_URL` | Verify / reset emails | Public site URL, e.g. `https://your-app.up.railway.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Server only — never `NEXT_PUBLIC_` |
| `GOOGLE_REDIRECT_URI` | Google OAuth | Must match exactly: `https://…/api/auth/google/callback` |
| `RESEND_API_KEY` | Email | Resend dashboard |
| `EMAIL_FROM` | Email | Verified sender address |

When `NODE_ENV=production` (Railway sets this), session cookies use `secure: true` (HTTPS only).

We do not use a separate `AUTH_SECRET` today — session tokens are random bytes, hashed in Mongo.

Also set realtime / S3 vars from `.env.example` when you deploy chat (see [deploy.md](../architecture/deploy.md)).

---

## 3. External services

### MongoDB Atlas
- [ ] Network access allows Railway (or, for learning only, `0.0.0.0/0`)
- [ ] Strong DB user; URI uses that user
- [ ] App uses `dbName: "teamhub"`

### Google OAuth
- [ ] Web client; redirect URI matches `GOOGLE_REDIRECT_URI`
- [ ] Prefer separate OAuth clients for local vs production

### Resend
- [ ] Domain / sender verified for production `EMAIL_FROM`
- [ ] Smoke-test verify + reset emails on the live URL

### HTTPS / cookies
- [ ] Site is served over HTTPS
- [ ] Cookie flags: HttpOnly, Secure, SameSite=Lax

---

## 4. Smoke tests after deploy

1. Signup → cookie → `/workspace`  
2. Verify link uses production `APP_URL`  
3. Wrong password → `AuthEvent` `signin.failure`  
4. Google sign-in → `/workspace`  
5. Forgot / reset password on the production domain  
6. Logout / logout-all  

---

## 5. Known limits

- In-memory rate limits are per Railway instance (not shared Redis yet)
- No CAPTCHA / lockout emails / AuthEvent admin UI yet

---

[← Auth docs](./README.md) · [Phase 8](../phases/08-quality-deployment/README.md) · [Deploy](../architecture/deploy.md)
