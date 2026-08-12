import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"

/** Pull user-facing message from RTK / fetch errors. */
export function aiErrorMessage(
  err: unknown,
  fallback = "AI request failed"
): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as FetchBaseQueryError).data
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message
      if (typeof msg === "string" && msg.trim()) return msg
    }
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
