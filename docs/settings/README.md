# Settings — module reference

**Status:** ✅ **v1 shipped** (Account + App · Aug 11–12, 2026)  
**Customer goal:** Control how the app looks and how this login is secured — without burying security under Profile.

## What v1 covers

| Area | Behavior |
|------|----------|
| Appearance | Light / Dark / System (`next-themes`) |
| Account | Email (read-only) · verified badge or resend verification |
| Password | Change while signed in · Google-only → set via Forgot password |
| Sessions | List active devices · revoke one · log out / logout-all · **max 2 devices** |
| Profile | Link to `/profile` (edit card stays there) |

**Route:** `/settings` · Sidebar **Settings** nav item.

### Device sessions (max 2)

- Each login creates a `Session` with `userAgent` + `ip` (best-effort).
- At most **2** concurrent sessions per user (`MAX_SESSIONS_PER_USER`).
- A **third** login **automatically expires the oldest** session so the new device can sign in.
- Settings shows the list with “This device” and **End** / **Sign out**.
- **SessionGuard** (app shell): on tab/window focus, revalidates via `GET /api/auth/me` and redirects to `/login` if the session is gone (evicted device or cleared cookies) — no manual refresh.
- RTK + axios 401 on app routes also bounce to login (skips credential-check auth forms).

## APIs

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/auth/me` | Includes `hasPassword` |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword, confirmPassword }` · keeps this session · revokes others |
| GET | `/api/auth/sessions` | `{ sessions[], maxSessions }` |
| DELETE | `/api/auth/sessions/:sessionId` | Revoke one · if current → clears cookie |
| POST | `/api/auth/resend-verification` | Existing |
| POST | `/api/auth/logout` · `/logout-all` | Existing |

## Out of scope (later)

- Notification preferences (no delivery system yet)
- Workspace settings hub (use workspace pages/dialogs)
- 2FA · billing · custom notification channels
- Choosing *which* session to kill on 3rd login (today: oldest)

---

[← Docs hub](../README.md)
