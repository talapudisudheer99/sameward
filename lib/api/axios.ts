import axios from "axios"

/**
 * Shared Axios instance for browser → our Next.js API routes.
 *
 * Why a shared instance?
 * - One place to set defaults (cookies, base URL, headers)
 * - Later: interceptors (auto-logout on 401, attach headers, etc.)
 *
 * Learning note vs fetch:
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
