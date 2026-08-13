/**
 * Extract unique http(s) URLs from channel message bodies for AI link-context.
 */

const URL_RE = /\bhttps?:\/\/[^\s<>"'`)\]]+/gi

/** Trailing punctuation often stuck to pasted URLs */
function trimUrlNoise(raw: string): string {
  let u = raw.trim()
  // Strip common trailing punctuation / markdown wrappers
  while (/[),.;:!?\]]+$/.test(u)) {
    u = u.slice(0, -1)
  }
  if (u.endsWith("'") || u.endsWith('"')) u = u.slice(0, -1)
  return u
}

/**
 * Collect unique absolute http(s) URLs from text blobs.
 * Order: first occurrence wins (caller should pass preferred texts first).
 */
export function extractUrlsFromTexts(
  texts: string[],
  maxUrls: number
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  for (const text of texts) {
    if (!text || out.length >= maxUrls) break
    const matches = text.match(URL_RE) ?? []
    for (const m of matches) {
      if (out.length >= maxUrls) break
      const cleaned = trimUrlNoise(m)
      let parsed: URL
      try {
        parsed = new URL(cleaned)
      } catch {
        continue
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue
      // Drop userinfo (credential injection / weirdness)
      if (parsed.username || parsed.password) continue
      // Normalize: drop hash (rarely needed for page content)
      parsed.hash = ""
      const key = parsed.href
      if (seen.has(key)) continue
      seen.add(key)
      out.push(key)
    }
  }

  return out
}
