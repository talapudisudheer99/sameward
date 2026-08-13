import { extractUrlsFromTexts } from "../lib/ai/extract-urls"
import {
  fetchLinkText,
  htmlToPlainText,
  isBlockedIp,
} from "../lib/ai/fetch-link-text"
import { collectUrlsForLinkContext } from "../lib/ai/link-context"

async function main() {
  const cases: Array<[string, boolean]> = [
    ["127.0.0.1", true],
    ["10.0.0.5", true],
    ["192.168.1.1", true],
    ["169.254.169.254", true],
    ["172.16.0.1", true],
    ["0.0.0.0", true],
    ["100.64.1.1", true],
    ["8.8.8.8", false],
    ["1.1.1.1", false],
  ]

  console.log("=== SSRF IP checks ===")
  for (const [ip, expectBlock] of cases) {
    const blocked = isBlockedIp(ip)
    const ok = blocked === expectBlock
    console.log(`${ok ? "OK" : "FAIL"} ${ip} → ${blocked ? "BLOCK" : "allow"}`)
  }

  const urls = extractUrlsFromTexts(
    [
      "see https://example.com/path). and https://example.com/path again http://user:pass@evil.com/",
    ],
    5
  )
  console.log("=== extract (expect one example.com, no creds) ===", urls)

  const msgs = [
    {
      id: "a",
      authorId: "1",
      authorName: "A",
      body: "old https://example.org/",
      createdAt: "",
      attachmentNames: [],
    },
    {
      id: "b",
      authorId: "1",
      authorName: "A",
      body: "target https://example.com/ — read this",
      createdAt: "",
      attachmentNames: [],
    },
  ]
  console.log(
    "=== prefer target ===",
    collectUrlsForLinkContext(msgs, ["b"])
  )

  const sample = htmlToPlainText(
    "<html><head><title>Hi</title></head><body><script>x</script><p>Hello <b>world</b></p></body></html>"
  )
  console.log("=== htmlToPlainText ===", sample)

  console.log("=== fetch example.com ===")
  const r = await fetchLinkText("https://example.com/")
  console.log(
    r.ok
      ? {
          title: r.title,
          excerpt: r.excerpt.slice(0, 160),
          finalUrl: r.finalUrl,
        }
      : r
  )

  console.log("=== fetch localhost (expect fail) ===")
  console.log(await fetchLinkText("http://127.0.0.1/"))

  console.log("=== fetch metadata IP (expect fail) ===")
  console.log(await fetchLinkText("http://169.254.169.254/latest/meta-data/"))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
