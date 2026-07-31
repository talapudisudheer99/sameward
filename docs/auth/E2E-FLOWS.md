# Auth end-to-end flows

Accurate to the current codebase (not the old Phase 2 draft).

---

## A) Email signup

```text
1. User: /signup  (React Hook Form + signupSchema)
2. POST /api/auth/signup
3. Rate limit by IP (5 / hour) → else 429 + rate_limit.hit
4. Zod validate → reject duplicate email (409) + signup.failure
5. bcrypt hash → User.create (emailVerified: false)
6. createAndSendVerification (try/catch — Resend fail does not block signup)
7. createSession(userId) → 7-day cookie + Session row
8. signup.success audit
9. Client: toast → router.replace("/workspace")
10. proxy: cookie present → allow
11. app layout: requireUser() → OK; banner if !emailVerified
```

---

## B) Email signin

```text
1. User: /login  (+ optional Remember me checkbox)
2. POST /api/auth/signin  { email, password, rememberMe }
3. Rate limit (10 / 15 min)
4. Find user + passwordHash; verifyPassword
5. Fail → 401 + signin.failure (reason: invalid_credentials)
   Success → createSession(userId, rememberMe)  // false=1d, true=30d
6. signin.success audit
7. Client → /workspace
```

Same client message for: unknown email, Google-only (no password), wrong password.

---

## C) Protected browse

```text
GET /workspace
  → proxy: no cookie? → /login?next=/workspace
  → app/(app)/layout: requireUser() → getCurrentUser()
       no/expired session? → redirect /login
  → if !emailVerified → VerifyEmailBanner above app (soft gate)
```

---

## D) Logout (this device)

```text
Sidebar LogoutButton → POST /api/auth/logout
  → getCurrentUser (for audit) → destroySession (delete one row + clear cookie)
  → audit: logout
  → client → /login
```

---

## E) Logout all devices

```text
Sidebar LogoutAllDevicesButton → POST /api/auth/logout-all
  → getCurrentUser required (401 if not)
  → destroyAllSessions(userId)  // deleteMany + clear this cookie
  → audit: logout_all
  → client → /login
Other devices: still have cookie until next request → getCurrentUser null → /login
```

---

## F) Forgot password

```text
1. /forgot-password → POST /api/auth/forgot-password
2. Always return OK_MESSAGE to client (no enumeration)
3. If user exists: store hashed reset token, email link with raw token
4. Audit: forgot_password.requested (email_sent | email_not_found)
```

---

## G) Reset password

```text
1. Email link → /reset-password?token=...
2. POST /api/auth/reset-password { token, password }
3. Lookup hash; expire/delete token; set passwordHash
4. Session.deleteMany({ userId })  // kill all devices
5. Audit success/failure → client goes to /login
```

---

## H) Google OAuth

```text
1. GoogleAuthButton → GET /api/auth/google
2. Rate limit → set google_oauth_state cookie → redirect Google
3. Google → GET /api/auth/google/callback?code&state
4. Validate state cookie; exchange code; fetch profile
5. Find by googleId, or link verified email, or create user (emailVerified: true)
6. createSession (7 days) → audit google.success → redirect /workspace
```

---

## I) Verify email (soft)

```text
1. Signup/resend emails link: GET /api/auth/verify-email?token=...
2. Hash lookup → set emailVerified true → delete token
3. Redirect /workspace (banner gone after refresh)
4. Resend: POST /api/auth/resend-verification (logged-in, rate limited)
```

---

## J) Audit trail (Option C)

Every important success/failure calls `logAuthEvent`:
- Writes `AuthEvent` in Mongo
- In non-production: `console.log` JSON line
- Failures inside the helper are swallowed (auth must continue)
