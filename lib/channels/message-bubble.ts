/** Wider layout for long copy / OG stacks (avoids thin “cylinder” bubbles). */
export function isExpandedBubble(
  body: string,
  hasPreviews: boolean
): boolean {
  if (hasPreviews) return true
  const t = body.trim()
  if (t.length >= 120) return true
  if (t.includes("\n")) return true
  return t.split(/\s+/).some((w) => w.length > 42)
}

/** Collapsed preview length for long bubbles (WhatsApp/Slack-style). */
export const MESSAGE_COLLAPSE_AT = 500

export function collapseMessagePreview(
  body: string,
  limit = MESSAGE_COLLAPSE_AT
): string {
  if (body.length <= limit) return body
  const slice = body.slice(0, limit)
  const breakAt = Math.max(slice.lastIndexOf("\n"), slice.lastIndexOf(" "))
  const cut = breakAt > limit * 0.55 ? breakAt : limit
  return body.slice(0, cut).trimEnd()
}
