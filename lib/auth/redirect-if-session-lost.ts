/**
 * Client-side bounce when the session cookie is gone or the DB session was revoked.
 * Only on authenticated app routes — never on /login (wrong password is also 401).
 */
export function redirectIfSessionLost(): void {
  if (typeof window === "undefined") return

  const path = window.location.pathname
  const inApp =
    path.startsWith("/workspace") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/explore")

  if (!inApp) return

  // Hard navigation clears RTK cache / in-memory UI after cookie wipe or eviction.
  window.location.replace("/login")
}
