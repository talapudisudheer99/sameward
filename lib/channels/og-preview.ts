/**
 * Open Graph / Twitter / classic meta → link preview for chat cards.
 * Uses the same SSRF-safe fetch as AI link-context.
 */

import { extractUrlsFromTexts } from "@/lib/ai/extract-urls"
import { fetchPublicHtml } from "@/lib/ai/fetch-link-text"
import { decodeHtmlEntities } from "@/lib/links/html-entities"
import type { LinkPreview } from "@/lib/types/channel/link-preview"

export type { LinkPreview }

export const OG_MAX_PREVIEWS_PER_MESSAGE = 2
export const OG_FETCH_TIMEOUT_MS = 4_000
/** Wait this long on send before responding; remaining work continues in background. */
export const OG_SEND_WAIT_MS = 2_200

function metaContent(html: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return decodeHtmlEntities(m[1]).replace(/\s+/g, " ").trim()
  }
  return null
}

function absoluteUrl(maybe: string | null, base: string): string | null {
  if (!maybe) return null
  try {
    const u = new URL(maybe, base)
    if (u.protocol !== "http:" && u.protocol !== "https:") return null
    if (u.username || u.password) return null
    return u.href
  } catch {
    return null
  }
}

function hostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function parseOpenGraphHtml(
  html: string,
  sourceUrl: string,
  finalUrl: string
): LinkPreview | null {
  const title =
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    (() => {
      const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      return t
        ? decodeHtmlEntities(t).replace(/\s+/g, " ").trim()
        : null
    })()

  if (!title) return null

  const description =
    metaContent(html, "og:description") ||
    metaContent(html, "twitter:description") ||
    metaContent(html, "description")

  const imageUrl = absoluteUrl(
    metaContent(html, "og:image") ||
      metaContent(html, "og:image:url") ||
      metaContent(html, "twitter:image") ||
      metaContent(html, "twitter:image:src"),
    finalUrl
  )

  const siteName =
    metaContent(html, "og:site_name") || hostnameLabel(finalUrl)

  const faviconUrl =
    absoluteUrl(
      html.match(
        /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i
      )?.[1] ??
        html.match(
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i
        )?.[1] ??
        null,
      finalUrl
    ) || absoluteUrl("/favicon.ico", finalUrl)

  return {
    url: sourceUrl,
    finalUrl,
    title: title.slice(0, 200),
    description: description ? description.slice(0, 280) : null,
    imageUrl,
    siteName: siteName ? siteName.slice(0, 120) : null,
    faviconUrl,
  }
}

export async function fetchOgPreview(
  urlString: string
): Promise<LinkPreview | null> {
  const doc = await fetchPublicHtml(urlString, OG_FETCH_TIMEOUT_MS)
  if (!doc.ok) return null
  const ct = doc.contentType?.toLowerCase() ?? ""
  if (ct && !ct.includes("html") && !doc.body.includes("<")) return null
  return parseOpenGraphHtml(doc.body, urlString, doc.finalUrl)
}

/**
 * Resolve up to N unique http(s) URLs in a message body into OG cards.
 */
export async function resolveLinkPreviews(
  body: string,
  max = OG_MAX_PREVIEWS_PER_MESSAGE
): Promise<LinkPreview[]> {
  const urls = extractUrlsFromTexts([body], max)
  if (urls.length === 0) return []

  const results = await Promise.all(urls.map((u) => fetchOgPreview(u)))
  return results.filter((p): p is LinkPreview => p != null)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Prefer returning previews quickly on send; if still pending, caller can
 * continue in background via `finalizeLinkPreviewsInBackground`.
 */
export async function resolveLinkPreviewsWithBudget(
  body: string,
  budgetMs = OG_SEND_WAIT_MS
): Promise<{ previews: LinkPreview[]; pending: Promise<LinkPreview[]> | null }> {
  const urls = extractUrlsFromTexts([body], OG_MAX_PREVIEWS_PER_MESSAGE)
  if (urls.length === 0) {
    return { previews: [], pending: null }
  }

  const work = resolveLinkPreviews(body)
  const raced = await Promise.race([
    work.then((previews) => ({ done: true as const, previews })),
    sleep(budgetMs).then(() => ({ done: false as const })),
  ])

  if (raced.done) {
    return { previews: raced.previews, pending: null }
  }
  return { previews: [], pending: work }
}
