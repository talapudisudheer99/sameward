# Auth API routes

All under `app/api/auth/`. Base URL: `/api/auth/...`

| Method | Path | Auth needed? | Purpose |
|--------|------|--------------|---------|
| POST | `/signup` | No | Create user + session |
| POST | `/signin` | No | Email/password login + session |
| POST | `/logout` | Cookie optional | Destroy current session |
| POST | `/logout-all` | Yes (session) | Destroy all user sessions |
| GET | `/me` | Cookie | Current user or 401 (prove-out / future clients) |
| GET | `/google` | No | Start OAuth (redirect) |
| GET | `/google/callback` | No | OAuth callback → session |
| POST | `/forgot-password` | No | Send reset email (always OK message) |
| POST | `/reset-password` | No (token) | Set new password; kill sessions |
| GET | `/verify-email` | No (token) | Mark email verified; redirect |
| POST | `/resend-verification` | Yes | Send another verify email |

---

## Detail cheat sheet

### `POST /signup`
- Body: `fullName`, `email`, `password`, `confirmPassword` (`signupSchema`)
- Rate: 5 / hour / IP
- Side effects: User, verify email (best-effort), session (7d), audit
- Status: `201` | `400` | `409` | `429` | `500`

### `POST /signin`
- Body: `email`, `password`, `rememberMe` (boolean)
- Rate: 10 / 15 min / IP
- Side effects: session (1d or 30d), audit
- Status: `200` | `400` | `401` | `429` | `500`

### `POST /logout`
- Clears current session row + cookie
- Audit: `logout` (includes user if cookie was valid)

### `POST /logout-all`
- Requires valid user; `deleteMany` by `userId`
- Audit: `logout_all`

### `GET /me`
- Returns safe user fields or `401`
- Useful for debugging session without opening the UI

### `GET /google` / `GET /google/callback`
- Start sets `google_oauth_state` httpOnly cookie
- Callback validates `state`, creates/links user, sets session, deletes state cookie
- Failures redirect to `/login?error=...`

### `POST /forgot-password`
- Body: `email`
- Rate: 5 / hour / IP
- Always same success message to client
- Audit reasons: `email_sent` | `email_not_found`

### `POST /reset-password`
- Body: `token`, `password` (+ confirm via schema)
- Invalid/expired token → `400` + `reset_password.failure`
- Success → update hash, delete token, delete all sessions

### `GET /verify-email?token=`
- Redirects to `/workspace` or `/login?error=...`
- Audit: `verify_email.success` | `verify_email.failure`

### `POST /resend-verification`
- Requires session; no-op message if already verified
- Rate: 5 / hour / IP

---

## Audit event names (F6)

| Event | Typical reason |
|-------|----------------|
| `signin.success` / `signin.failure` | `invalid_credentials`, `internal_error` |
| `signup.success` / `signup.failure` | `email_already_registered`, `internal_error` |
| `logout` / `logout_all` | — |
| `forgot_password.requested` | `email_sent`, `email_not_found`, `internal_error` |
| `reset_password.success` / `failure` | `invalid_or_expired_token`, … |
| `google.success` / `google.failure` | `cancelled`, `invalid_state`, … |
| `verify_email.success` / `failure` | `missing_token`, `invalid_or_expired_token`, … |
| `rate_limit.hit` | `signin`, `signup`, `forgot_password`, `google`, `resend_verification` |

Collection: `authevents` (Mongoose model `AuthEvent`). Never contains passwords or raw tokens.

---

## Rate limits (F3)

Implemented in `lib/auth/rate-limit.ts` — **in-memory `Map`** (resets on server restart; not shared across serverless instances).

| Route | Limit |
|-------|-------|
| signin | 10 / 15 min |
| signup | 5 / hour |
| forgot-password | 5 / hour |
| resend-verification | 5 / hour |
| google start | 20 / 15 min |
