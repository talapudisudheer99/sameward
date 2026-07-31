import { NextResponse } from "next/server"

type Entry = {
  count: number
  resetAt: number
}

const hits = new Map<string, Entry>()

export function rateLimit(options: {
  key: string
  limit: number
  windowMs: number
}): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now()
  const entry = hits.get(options.key)

  if (!entry || now >= entry.resetAt) {
    hits.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return { ok: true }
  }

  if (entry.count < options.limit) {
    entry.count += 1
    hits.set(options.key, entry)
    return { ok: true }
  }

  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
  return { ok: false, retryAfterSeconds }
}

export function getClientIp(request: Request): string {
  // Next/dev often sets this (e.g. "::1" on localhost)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown"
  }
  return "unknown"
}

/** Build a 429 response — caller must `return` this */
export function tooManyRequestsResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { message: "Too many attempts. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  )
}
