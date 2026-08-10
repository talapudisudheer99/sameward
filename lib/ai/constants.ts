/** Shared caps for Path A AI context windows. */

export const AI_DEFAULT_MESSAGE_LIMIT = 50
export const AI_MAX_MESSAGE_LIMIT = 100
export const AI_MAX_CONTEXT_CHARS = 48_000
export const AI_NEIGHBOR_COUNT = 8
export const AI_DEFAULT_MODEL = "gpt-4o-mini"

/** Soft rate limit: requests per user per rolling hour */
export const AI_RATE_LIMIT_PER_HOUR = 30

export type AiKind =
  "summarize" | "catch-up" | "ask" | "explain" | "draft-reply" | "notes"

export function resolveAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || AI_DEFAULT_MODEL
}
