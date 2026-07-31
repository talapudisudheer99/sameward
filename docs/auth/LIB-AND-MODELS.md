# Auth libraries & models

## `lib/auth/`

| File | Responsibility |
|------|----------------|
| `cookies.ts` | Cookie name; short/medium/long maxAge; `sessionCookieOptions(maxAge)` |
| `session.ts` | `hashToken`, `createSession`, `getCurrentUser`, `destroySession`, `destroyAllSessions` |
| `password.ts` | `hashPassword` / `verifyPassword` (bcrypt) |
| `require-user.ts` | Server Components: user or `redirect("/login")` |
| `rate-limit.ts` | In-memory fixed window + `getClientIp` + 429 helper |
| `audit.ts` | `logAuthEvent` — Mongo + dev console; never throws to caller |
| `email.ts` | Resend: reset + verification emails |
| `email-verification.ts` | Create token + send verify mail |

## `lib/db/mongoose.ts`

Cached connection; `dbName: "teamhub"`. Call `connectDB()` before queries in route handlers / session helpers.

## Models (`lib/models/`)

| Model | Collection purpose |
|-------|--------------------|
| `User` | Account: `fullName`, `email`, `passwordHash?`, `googleId?`, `emailVerified` |
| `Session` | One row per device login: `tokenHash`, `userId`, `expiresAt` (TTL) |
| `PasswordResetToken` | Hashed reset tokens + expiry |
| `EmailVerificationToken` | Hashed verify tokens + expiry |
| `AuthEvent` | Security audit trail |

**Hot reload note:** In non-production, `User` model may be deleted from `models` cache so new fields (e.g. `emailVerified`) are not stripped. See comments in `user.ts`.

## Proxy

`proxy.ts` (Next.js 16 name for middleware): matcher `/workspace/:path*` only. Reads `SESSION_COOKIE_NAME`. No Mongo.

## Zod vs Mongoose

- **Zod** = request/form shape at the boundary.
- **Mongoose Schema** = document shape in Mongo.
- Both can validate; we use both intentionally.
