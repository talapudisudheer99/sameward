/** Shared caps for Path A AI context windows. */

export const AI_DEFAULT_MESSAGE_LIMIT = 50
export const AI_MAX_MESSAGE_LIMIT = 100
export const AI_MAX_CONTEXT_CHARS = 48_000
export const AI_NEIGHBOR_COUNT = 8
export const AI_DEFAULT_MODEL = "gpt-4o-mini"

/** Soft rate limit: requests per user per rolling hour */
export const AI_RATE_LIMIT_PER_HOUR = 30

/** V1 link-context — AI-time URL fetch caps (docs/ai/LINK-CONTEXT.md) */
export const AI_MAX_LINK_URLS = 5
export const AI_LINK_MAX_EXCERPT_CHARS = 4_000
export const AI_LINK_MAX_BYTES = 512_000
export const AI_LINK_FETCH_TIMEOUT_MS = 5_000
export const AI_LINK_MAX_REDIRECTS = 3
export const AI_LINK_USER_AGENT =
  "SamewardBot/1.0 (+https://github.com/talapudisudheer99/teamhub-ai; link-context)"

export type AiKind =
  "summarize" | "catch-up" | "ask" | "explain" | "draft-reply" | "notes"

export function resolveAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || AI_DEFAULT_MODEL
}
