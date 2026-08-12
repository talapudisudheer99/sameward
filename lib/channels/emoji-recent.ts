import { QUICK_EMOJI } from "@/lib/channels/emoji-catalog"

const STORAGE_KEY = "teamhub-emoji-recent-v1"
const MAX_RECENT = 24

export function readRecentEmoji(): string[] {
  if (typeof window === "undefined") return [...QUICK_EMOJI]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...QUICK_EMOJI]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [...QUICK_EMOJI]
    const cleaned = parsed.filter(
      (x): x is string => typeof x === "string" && x.length > 0 && x.length <= 16
    )
    return cleaned.length > 0 ? cleaned.slice(0, MAX_RECENT) : [...QUICK_EMOJI]
  } catch {
    return [...QUICK_EMOJI]
  }
}

export function pushRecentEmoji(emoji: string): string[] {
  const prev = readRecentEmoji().filter((e) => e !== emoji)
  const next = [emoji, ...prev].slice(0, MAX_RECENT)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
  return next
}
