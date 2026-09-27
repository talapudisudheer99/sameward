import axios, { isAxiosError } from "axios"

import { redirectIfSessionLost } from "@/lib/auth/redirect-if-session-lost"

/**
 * Shared Axios instance for browser → our Next.js API routes.
 *
 * Why a shared instance?
 * - One place to set defaults (cookies, base URL, headers)
 * - Later: interceptors (auto-logout on 401, attach headers, etc.)
 *
 * Why axios over fetch:
 * - fetch: you pass credentials/headers on EVERY call
 * - axios: set once here, every `api.post(...)` reuses them
 */
export const api = axios.create({
  // Same-origin API routes like /api/auth/signin
  baseURL: "/",
  // Send + accept cookies (our httpOnly session cookie)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

/** Auth form endpoints return 401 for bad credentials — never treat as session loss. */
function isCredentialCheckUrl(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes("/api/auth/signin") ||
    url.includes("/api/auth/signup") ||
    url.includes("/api/auth/forgot-password") ||
    url.includes("/api/auth/reset-password")
  )
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !isCredentialCheckUrl(error.config?.url)
    ) {
      redirectIfSessionLost()
    }
    return Promise.reject(error)
  }
)
