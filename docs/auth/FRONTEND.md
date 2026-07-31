# Auth frontend

## Pages (`app/(auth)/`)

| URL | File | Calls |
|-----|------|--------|
| `/login` | `login/page.tsx` | `POST /api/auth/signin`; Google button → `/api/auth/google` |
| `/signup` | `signup/page.tsx` | `POST /api/auth/signup` |
| `/forgot-password` | `forgot-password/page.tsx` | `POST /api/auth/forgot-password` |
| `/reset-password` | `reset-password/page.tsx` | reads `?token=`; `POST /api/auth/reset-password` |

Shared layout: `app/(auth)/layout.tsx` (marketing auth chrome).

Protected app: `app/(app)/layout.tsx` + `app/(app)/workspace/...`  
Uses `requireUser()` and optional `VerifyEmailBanner`.

---

## Components

| Component | Path | Role |
|-----------|------|------|
| `AuthShell` | `components/marketing/auth-shell.tsx` | Login/signup page frame |
| `GoogleAuthButton` / `AuthDivider` | `components/marketing/google-auth-button.tsx` | OAuth entry |
| `AppFormField` | `components/forms/app-form-field.tsx` | RHF + Zod fields |
| `SubmitButton` | `components/buttons/submit-button.tsx` | Loading submit |
| `LogoutButton` | `components/layout/logout-button.tsx` | `POST /logout` |
| `LogoutAllDevicesButton` | `components/layout/logout-all-devices-button.tsx` | `POST /logout-all` |
| `VerifyEmailBanner` | `components/layout/verify-email-banner.tsx` | Soft gate + resend |
| `Sidebar` | `components/layout/sidebar.tsx` | Hosts both logout actions |

HTTP client: `lib/api/axios.ts` (`api.post(...)`). Axios throws on 4xx/5xx — forms catch with `isAxiosError`.

---

## Form schemas (shared with API)

| Schema | File | Used by |
|--------|------|---------|
| Signup | `lib/schemas/auth/signup-schema.ts` | signup page + API |
| Login | `lib/schemas/auth/login-schema.ts` | login + signin (`rememberMe: boolean`) |
| Forgot | `lib/schemas/auth/forgot-password-schema.ts` | forgot page + API |
| Reset | `lib/schemas/auth/reset-password-schema.ts` | reset page + API |

---

## UX notes

- Login shows Google OAuth errors from `?error=` (callback redirect).
- Remember me is wired (not decorative).
- Soft verify: user can use the app with a banner until they click the email link.
- After logout / logout-all: `router.replace("/login")` + `router.refresh()`.
