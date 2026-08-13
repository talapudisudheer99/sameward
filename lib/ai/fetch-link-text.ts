/**
 * SSRF-safe public page fetch → plain text excerpt for AI prompts.
 *
 * Pattern (OWASP / industry): resolve DNS → reject private IPs → pin connect
 * to that address (defeat DNS rebinding TOCTOU) → no auto-follow redirects
 * without re-validating each hop. See docs/ai/LINK-CONTEXT.md.
 */

import dns from "node:dns/promises"
import net from "node:net"
import { Agent, fetch as undiciFetch } from "undici"

import {
  AI_LINK_FETCH_TIMEOUT_MS,
  AI_LINK_MAX_BYTES,
  AI_LINK_MAX_EXCERPT_CHARS,
  AI_LINK_MAX_REDIRECTS,
  AI_LINK_USER_AGENT,
} from "@/lib/ai/constants"
import { decodeHtmlEntities } from "@/lib/links/html-entities"

export type LinkFetchOk = {
  ok: true
  url: string
  finalUrl: string
  title: string | null
  excerpt: string
}

export type LinkFetchFail = {
  ok: false
  url: string
  reason: string
}

export type LinkFetchResult = LinkFetchOk | LinkFetchFail

function fail(url: string, reason: string): LinkFetchFail {
  return { ok: false, url, reason }
}

/** IPv4 dotted → unsigned int */
function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".")
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null
    const v = Number(p)
    if (v > 255) return null
    n = (n << 8) + v
  }
  return n >>> 0
}

function inCidrV4(ip: string, base: string, prefix: number): boolean {
  const a = ipv4ToInt(ip)
  const b = ipv4ToInt(base)
  if (a == null || b == null) return false
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
  return (a & mask) === (b & mask)
}

/**
 * True if connecting here would be SSRF-dangerous (loopback, private, link-local,
 * CGNAT, metadata, multicast, etc.).
 */
export function isBlockedIp(address: string): boolean {
  const family = net.isIP(address)
  if (family === 0) return true

  if (family === 4) {
    if (inCidrV4(address, "0.0.0.0", 8)) return true
    if (inCidrV4(address, "10.0.0.0", 8)) return true
    if (inCidrV4(address, "127.0.0.0", 8)) return true
    if (inCidrV4(address, "169.254.0.0", 16)) return true // incl. 169.254.169.254
    if (inCidrV4(address, "172.16.0.0", 12)) return true
    if (inCidrV4(address, "192.168.0.0", 16)) return true
    if (inCidrV4(address, "100.64.0.0", 10)) return true // CGNAT
    if (inCidrV4(address, "192.0.0.0", 24)) return true
    if (inCidrV4(address, "192.0.2.0", 24)) return true // TEST-NET
    if (inCidrV4(address, "198.51.100.0", 24)) return true
    if (inCidrV4(address, "203.0.113.0", 24)) return true
    if (inCidrV4(address, "224.0.0.0", 4)) return true // multicast
    if (inCidrV4(address, "240.0.0.0", 4)) return true // reserved
    return false
  }

  // IPv6
  const lower = address.toLowerCase()
  if (lower === "::" || lower === "::1") return true
  if (lower.startsWith("fe80:")) return true // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true // ULA
  if (lower.startsWith("ff")) return true // multicast
  // IPv4-mapped :ffff:a.b.c.d
  const mapped = lower.match(/^:ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped?.[1]) return isBlockedIp(mapped[1])
  const mappedHex = lower.match(/^:ffff:([0-9a-f:.]+)$/)
  if (mappedHex && lower.includes(".")) {
    const maybe = lower.slice(lower.lastIndexOf(":") + 1)
    if (net.isIP(maybe) === 4) return isBlockedIp(maybe)
  }
  return false
}

function assertSafeUrlString(raw: string): URL {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    throw new Error("invalid URL")
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("only http(s) allowed")
  }
  if (u.username || u.password) {
    throw new Error("URL credentials not allowed")
  }
  const host = u.hostname
  if (!host || host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("localhost blocked")
  }
  // Literal IP in hostname
  if (net.isIP(host) !== 0 && isBlockedIp(host)) {
    throw new Error("private or reserved IP blocked")
  }
  return u
}

async function resolvePublicAddress(
  hostname: string
): Promise<{ address: string; family: 4 | 6 }> {
  if (net.isIP(hostname) !== 0) {
    if (isBlockedIp(hostname)) throw new Error("private or reserved IP blocked")
    return {
      address: hostname,
      family: net.isIP(hostname) === 6 ? 6 : 4,
    }
  }

  const results = await dns.lookup(hostname, { all: true, verbatim: true })
  if (!results.length) throw new Error("DNS lookup returned no addresses")

  // Prefer IPv4 when both are public — fewer edge cases on some hosts
  const publicAddrs = results.filter((r) => !isBlockedIp(r.address))
  if (!publicAddrs.length) {
    throw new Error("hostname resolves only to blocked addresses")
  }
  const v4 = publicAddrs.find((r) => r.family === 4)
  const chosen = v4 ?? publicAddrs[0]!
  return { address: chosen.address, family: chosen.family === 6 ? 6 : 4 }
}

function createPinnedAgent(address: string, family: 4 | 6): Agent {
  return new Agent({
    connect: {
      // Node may call lookup with `{ all: true }` (dual-stack). Pin must honor both shapes.
      lookup(_hostname, options, callback) {
        const opts = options as { all?: boolean } | undefined
        if (opts?.all) {
          callback(null, [{ address, family }])
          return
        }
        callback(null, address, family)
      },
    },
  })
}

export function htmlToPlainText(html: string): { title: string | null; text: string } {
  const titleRaw =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? null
  const title = titleRaw
    ? decodeHtmlEntities(titleRaw.replace(/\s+/g, " "))
    : null

  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")

  body = decodeHtmlEntities(body)
  body = body
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  return { title, text: body }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trimEnd()}…`
}

function isAllowedContentType(ct: string | null): boolean {
  if (!ct) return true // some servers omit; still try if body looks like text
  const base = ct.split(";")[0]?.trim().toLowerCase() ?? ""
  return (
    base === "text/html" ||
    base === "text/plain" ||
    base === "application/xhtml+xml" ||
    base.startsWith("text/")
  )
}

async function readBodyCapped(
  res: Awaited<ReturnType<typeof undiciFetch>>,
  maxBytes: number
): Promise<string> {
  if (!res.body) return ""
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    total += value.byteLength
    if (total > maxBytes) {
      chunks.push(value.slice(0, Math.max(0, maxBytes - (total - value.byteLength))))
      try {
        await reader.cancel()
      } catch {
        /* ignore */
      }
      break
    }
    chunks.push(value)
  }
  const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)))
  return buf.toString("utf8")
}

async function fetchOnce(
  url: URL,
  address: string,
  family: 4 | 6,
  signal: AbortSignal
): Promise<{
  status: number
  location: string | null
  contentType: string | null
  body: string
}> {
  const agent = createPinnedAgent(address, family)
  try {
    const res = await undiciFetch(url, {
      method: "GET",
      redirect: "manual",
      signal,
      dispatcher: agent,
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
        "User-Agent": AI_LINK_USER_AGENT,
        "Accept-Language": "en",
      },
    })
    const location = res.headers.get("location")
    const contentType = res.headers.get("content-type")
    const body =
      res.status >= 200 && res.status < 300
        ? await readBodyCapped(res, AI_LINK_MAX_BYTES)
        : ""
    // Drain redirect responses without reading huge bodies
    if (res.status >= 300 && res.status < 400 && res.body) {
      try {
        await res.body.cancel()
      } catch {
        /* ignore */
      }
    }
    return { status: res.status, location, contentType, body }
  } finally {
    await agent.close()
  }
}

/**
 * Fetch one public URL safely and return raw HTML/text body (shared by AI + OG).
 */
export async function fetchPublicHtml(
  urlString: string,
  timeoutMs: number = AI_LINK_FETCH_TIMEOUT_MS
): Promise<
  | {
      ok: true
      url: string
      finalUrl: string
      contentType: string | null
      body: string
    }
  | LinkFetchFail
> {
  let current: URL
  try {
    current = assertSafeUrlString(urlString)
  } catch (e) {
    return fail(urlString, e instanceof Error ? e.message : "invalid URL")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    for (let hop = 0; hop <= AI_LINK_MAX_REDIRECTS; hop++) {
      let pinned: { address: string; family: 4 | 6 }
      try {
        pinned = await resolvePublicAddress(current.hostname)
      } catch (e) {
        return fail(
          urlString,
          e instanceof Error ? e.message : "DNS validation failed"
        )
      }

      let res: Awaited<ReturnType<typeof fetchOnce>>
      try {
        res = await fetchOnce(
          current,
          pinned.address,
          pinned.family,
          controller.signal
        )
      } catch (e) {
        if (controller.signal.aborted) {
          return fail(urlString, "fetch timed out")
        }
        return fail(
          urlString,
          e instanceof Error ? e.message : "fetch failed"
        )
      }

      if (res.status >= 300 && res.status < 400 && res.location) {
        let next: URL
        try {
          next = new URL(res.location, current)
          next = assertSafeUrlString(next.href)
        } catch (e) {
          return fail(
            urlString,
            e instanceof Error ? e.message : "unsafe redirect"
          )
        }
        current = next
        continue
      }

      if (res.status < 200 || res.status >= 300) {
        return fail(urlString, `HTTP ${res.status}`)
      }

      if (!isAllowedContentType(res.contentType)) {
        return fail(urlString, "unsupported content type")
      }

      return {
        ok: true,
        url: urlString,
        finalUrl: current.href,
        contentType: res.contentType,
        body: res.body,
      }
    }

    return fail(urlString, "too many redirects")
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch one public URL safely and return a short plain-text excerpt.
 */
export async function fetchLinkText(urlString: string): Promise<LinkFetchResult> {
  const doc = await fetchPublicHtml(urlString)
  if (!doc.ok) return doc

  const ct = doc.contentType?.toLowerCase() ?? ""
  let title: string | null = null
  let text: string
  if (
    ct.includes("text/plain") ||
    (!ct.includes("html") && !doc.body.includes("<"))
  ) {
    text = doc.body
  } else {
    const parsed = htmlToPlainText(doc.body)
    title = parsed.title
    text = parsed.text
  }

  text = truncate(text.replace(/\s+/g, " ").trim(), AI_LINK_MAX_EXCERPT_CHARS)
  if (!text) {
    return fail(urlString, "empty page text")
  }

  return {
    ok: true,
    url: urlString,
    finalUrl: doc.finalUrl,
    title,
    excerpt: text,
  }
}

