import { AI_RATE_LIMIT_PER_HOUR } from "@/lib/ai/constants"

type Bucket = { count: number; resetAt: number }

/** In-memory per-user rolling hour. Fine for single-instance Next; Redis later. */
const buckets = new Map<string, Bucket>()

export type RateLimitResult =
  { ok: true; remaining: number } | { ok: false; retryAfterSec: number }

export function checkAiRateLimit(userId: string): RateLimitResult {
  const now = Date.now()
  const key = userId
  let bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + 60 * 60 * 1000 }
    buckets.set(key, bucket)
  }

  if (bucket.count >= AI_RATE_LIMIT_PER_HOUR) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return {
    ok: true,
    remaining: AI_RATE_LIMIT_PER_HOUR - bucket.count,
  }
}
