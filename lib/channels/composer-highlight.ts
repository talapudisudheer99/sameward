/**
 * Split composer text into plain + highlight segments (URLs, @mentions).
 */

export type HighlightKind = "url" | "mention" | "plain"

export type HighlightSegment = {
  text: string
  kind: HighlightKind
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isMentionToken(part: string, mentionNames: string[]): boolean {
  if (part.toLowerCase() === "@all") return true
  return mentionNames.some((n) => part === `@${n}`)
}

/**
 * Build segments for live composer highlighting.
 * Mentions: @all + @Full Name (longest names first). URLs: http(s).
 */
export function segmentComposerHighlights(
  text: string,
  mentionNames: string[] = []
): HighlightSegment[] {
  if (!text) return [{ text: "", kind: "plain" }]

  const names = [...mentionNames]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)

  const nameAlt = names.length > 0 ? `|@(?:${names.join("|")})` : ""
  const re = new RegExp(
    `(https?:\\/\\/[^\\s<>"'\\\`)\\]]+|@all\\b${nameAlt})`,
    "gi"
  )

  const parts = text.split(re)
  const out: HighlightSegment[] = []

  for (const part of parts) {
    if (!part) continue
    if (/^https?:\/\//i.test(part)) {
      out.push({ text: part, kind: "url" })
    } else if (isMentionToken(part, mentionNames)) {
      out.push({ text: part, kind: "mention" })
    } else {
      out.push({ text: part, kind: "plain" })
    }
  }

  return out.length > 0 ? out : [{ text, kind: "plain" }]
}
