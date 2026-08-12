/**
 * Reaction allowlist = full curated catalog (Slack-style: react with any picker emoji).
 * QUICK_EMOJI kept for empty “Recent” row defaults.
 */
import {
  isCatalogEmoji,
  QUICK_EMOJI,
} from "@/lib/channels/emoji-catalog"

export { QUICK_EMOJI as REACTION_EMOJI }

export function isAllowedReactionEmoji(value: string): boolean {
  return isCatalogEmoji(value)
}
