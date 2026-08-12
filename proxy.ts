import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies"

/**
 * proxy.ts (Next.js 16 — replaces the old middleware.ts name)
 *
 * Runs BEFORE a page/route renders. Think of it as a bouncer at the door:
 * - Guest trying to enter /workspace, /explore, or /profile? → send them to /login
 * - Cookie present? → let them through (the page still re-checks the session later)
 *
 * Important limitation:
 * Keep this file LIGHT. Do NOT call Mongo / Mongoose here.
 * Proxy can run on the Edge / CDN. DB lookups belong in Route Handlers
 * and Server Components (getCurrentUser) — defense in depth.
 */
export function proxy(request: NextRequest) {
  // Read the cookie the browser automatically attached to this request.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // No ticket at all → not logged in.
  if (!token) {
    // Build /login?next=/workspace so after login we can send them back.
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", request.nextUrl.pathname)

    return NextResponse.redirect(loginUrl)
  }

  // Cookie exists → allow the request to continue to the page.
  // (A fake/expired cookie will still be caught later by getCurrentUser.)
  return NextResponse.next()
}

/**
 * Only run this bouncer on protected app routes.
 * Public pages (/ , /login , /signup) and /api/* are NOT matched.
 */
export const config = {
  matcher: [
    "/workspace/:path*",
    "/explore",
    "/explore/:path*",
    "/profile",
    "/profile/:path*",
  ],
}
