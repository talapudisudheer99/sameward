# Link context for AI (V1) — product + flow

**Status:** ✅ **Shipped** (Aug 13, 2026) · story **US-AI10** · verify: `npm run verify:link-context`  
**Module SoT:** this note + [USER-STORIES.md](./USER-STORIES.md) · [E2E-FLOWS.md](./E2E-FLOWS.md) · [TASKS.md](./TASKS.md)  
**Scope:** **AI-time** link reading into prompts. Chat **OG preview cards** are a separate channels feature → [LINK-PREVIEWS.md](../channels/LINK-PREVIEWS.md).

---

## 1. Customer problem

Teams paste URLs while they talk: Stack Overflow answers, GitHub issues, docs, design specs.

Without this slice, TeamHub stored and showed the **raw URL string**. Channel AI only saw that string — not the page. If the chat is “see this SO answer” + a link, the model had almost no useful context.

**Emotion:** *“The AI read what we linked.”* Pretty unfurl cards are nice UX (channels) but are not what makes Ask/Explain smarter.

---

## 2. What we shipped (AI V1)

| In scope | Out of this module |
|----------|--------------------|
| Detect `http`/`https` URLs in message bodies used for an AI run | Chat OG / unfurl UI (see channels [LINK-PREVIEWS](../channels/LINK-PREVIEWS.md)) |
| On **AI request only**, fetch public page text (HTML → plain text) | Background crawl of every message solely for AI |
| Cap URLs per run + chars per page; inject short excerpts into the prompt | OCR / PDF / login-walled content |
| Fail soft: if fetch fails, AI still runs on message text alone + note | SSRF to private IPs / cloud metadata |
| Same Path A rules: read-only, per channel, never auto-post | Storing full page HTML in Mongo forever |
| Meta: `linksFetched` / `linksFailed` / `linksAttempted` on AI responses | — |

---

## 3. Clear flow (as built)

```text
1. Member uses Explain / Catch up / Summarize / Ask / Draft / Notes
2. Server builds authorized message window (requireChannelAccess → message-context)
3. completeWithContext → buildLinkContext:
     extract unique http(s) URLs (cap 5; Explain prefers target message URLs)
4. For each URL (parallel, 5s timeout):
     a. SSRF guard (http/https only; DNS resolve → block private/link-local/metadata)
     b. undici fetch pinned to validated IP (defeats DNS rebinding TOCTOU)
     c. Manual redirects, re-validate each hop (max 3)
     d. HTML→text (strip head/script/style); truncate excerpt
5. Append “Linked pages” block to the user prompt
6. AiProvider completes; response meta includes link counts
7. Panel / Explain dialog may show “N linked pages”
```

**When it runs:** only inside `completeWithContext` (`lib/ai/run-ai.ts`) — **not** on every chat send.  
(Message send may still resolve **OG cards** for the transcript — that path is channels-owned.)

---

## 4. Code map

```text
lib/ai/
  extract-urls.ts      # ✅ unique http(s) from bodies (also used by OG)
  fetch-link-text.ts   # ✅ SSRF-safe fetch + HTML→text (+ fetchPublicHtml for OG)
  link-context.ts      # ✅ orchestrate + format block
  run-ai.ts            # ✅ wires after context, before provider
  constants.ts         # ✅ AI_MAX_LINK_URLS, timeouts, byte caps

lib/links/
  html-entities.ts     # ✅ shared decode for AI text + OG meta

scripts/verify-link-context.ts  # manual SSRF + example.com smoke
```

---

## 5. Security (as implemented)

1. **SSRF:** scheme allowlist; reject URL credentials; block localhost hostnames; classify resolved IPs (RFC1918, loopback, link-local incl. `169.254.169.254`, CGNAT, multicast, ULA, …).
2. **DNS pinning:** resolve → validate → undici `Agent` `connect.lookup` returns only that address (supports Node `{ all: true }` lookup shape).
3. **Redirects:** `redirect: "manual"`; each `Location` re-parsed and re-validated.
4. **Timeouts + max bytes** before parse; no TeamHub cookies forwarded.
5. Fetched text treated as **untrusted** in prompts (system + block copy).

---

## 6. Research notes (post-implementation)

Sources consulted while building:

- [OWASP — SSRF Prevention in Node.js](https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs)
- Industry write-ups on **DNS rebinding / TOCTOU** (validate-then-fetch without pinning is insufficient)
- undici `Agent` connect lookup behavior on Node 24

**Findings we hit in this repo**

| Finding | What we did |
|---------|-------------|
| Hostname string checks alone are not enough | Always resolve DNS and classify the IP |
| Pinning must support `lookup(..., { all: true })` | Without it, Node dual-stack path passes `undefined` IP → `ERR_INVALID_IP_ADDRESS` |
| Prefer IPv4 when both public | Fewer dual-stack surprises; still allow IPv6-only hosts |
| Soft-fail is product-correct | Bad/blocked URLs must not 500 the AI route |
| AI-time fetch > send-time crawl for AI | Cheaper, clearer authz boundary, matches Path A |

**Verify locally**

```bash
npm run verify:link-context
```

Expect: private IPs **BLOCK**; `https://example.com/` **OK** with title + excerpt; localhost / metadata **fail** soft.

Manual product E2E: seed a public docs/SO URL in chat → Explain / Ask → meta shows linked pages; answer uses page substance (S14 in [E2E-FLOWS.md](./E2E-FLOWS.md)).

---

## 7. Product decisions (locked for AI V1)

| # | Decision |
|---|----------|
| 1 | **AI-time fetch only** for prompt context — not a send-time AI crawl |
| 2 | **UI preview cards** live under channels ([LINK-PREVIEWS](../channels/LINK-PREVIEWS.md)); AI still uses page text at request time |
| 3 | Cap URLs + excerpt size; prefer target-message URLs for Explain |
| 4 | Soft failure — AI still works without links |
| 5 | Same authz as chat; links from inaccessible channels never appear |
| 6 | V1.5 (large history / Ask sources / cache) stays a **separate** track |

---

[← README](./README.md) · [Stories →](./USER-STORIES.md) · [E2E →](./E2E-FLOWS.md) · [Tasks →](./TASKS.md)
