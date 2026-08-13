# Auth hardening (F1–F7)

Phase **2B**. All items done. Full mentoring log was retired; this is the lasting reference.

| # | Feature | What shipped |
|---|---------|----------------|
| **F1** | Defense in depth | `requireUser()` in `app/(app)/layout.tsx`; proxy stays cookie-only |
| **F2** | Email verification | Soft gate: banner + verify link + resend; Google users start verified |
| **F3** | Rate limiting | In-memory fixed window on signup/signin/forgot/resend/google |
| **F4** | Logout all devices | `POST /logout-all` + `destroyAllSessions` + sidebar button |
| **F5** | Remember me | Login checkbox → 1d vs 30d; signup/Google stay 7d |
| **F6** | Audit logging | `AuthEvent` + dev JSON logs; best-effort helper |
| **F7** | Production checklist | [PRODUCTION.md](./PRODUCTION.md) + root `.env.example` |

---

## Decisions locked

- Soft email verify now; hard gates later (e.g. invites in Phase 3+).
- Google = real OAuth; password optional (Approach 3).
- Forgot-password can set first password for Google-only users.
- Audit = Mongo + console in non-production (Option C).
- Railway production deploy is Phase 8 (see [deploy.md](../architecture/deploy.md)).

---

## Why each matters (interview)

| # | One line |
|---|----------|
| F1 | Edge gate ≠ authorization; always re-check the session in the app/API. |
| F2 | Progressive trust: use the product, but prove inbox ownership for sensitive actions later. |
| F3 | Slow credential stuffing without blocking legitimate users forever. |
| F4 | Stolen laptop / shared PC → kill every hashed session for that userId. |
| F5 | Same auth mechanism; only TTL changes — cookie and DB must match. |
| F6 | Who/when/where for security events, never secrets; logging outages must not break auth. |
| F7 | Env + OAuth redirect + email domain + HTTPS Secure cookies before go-live. |
