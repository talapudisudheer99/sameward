# Link context for AI (V1) — product + flow

**Status:** 📋 **Docs locked** (Aug 13, 2026) · ⬜ **Code not started** — implement when PO says go  
**Module SoT:** this note + [USER-STORIES.md](./USER-STORIES.md) (US-AI10) · [E2E-FLOWS.md](./E2E-FLOWS.md) · [TASKS.md](./TASKS.md)  
**Scope:** **V1 only** — AI-time link reading. Rich Slack-style link *preview cards* in the transcript are **out of V1** (nice UX later).

---

## 1. Customer problem

Teams paste URLs while they talk: Stack Overflow answers, GitHub issues, docs, design specs.

Today TeamHub stores and shows the **raw URL string**. Channel AI (Explain / Catch up / Ask / …) only sees that string — not the page. If the chat is “see this SO answer” + a link, the model has almost no useful context.

**Emotion:** *“The AI read what we linked,”* not *“pretty cards under every URL.”*

---

## 2. What we will ship in V1

| In V1 | Out of V1 |
|-------|-----------|
| Detect `http`/`https` URLs in message bodies used for an AI run | Fancy unfurl / OG preview cards in the chat UI |
| On **AI request only**, fetch public page text (HTML → plain text) | Background crawl of every message on send |
| Cap URLs per run + chars per page; inject short excerpts into the prompt | OCR / PDF / login-walled content |
| Fail soft: if fetch fails, AI still runs on message text alone + note | SSRF to private IPs / cloud metadata |
| Same Path A rules: read-only, per channel, never auto-post | Storing full page HTML in Mongo forever |

---

## 3. Clear flow (end-to-end)

```text
1. Member uses Explain / Catch up / Summarize / Ask / Draft / Notes as today
2. Server builds authorized message window (requireChannelAccess → message-context)
3. Extract unique http(s) URLs from those message bodies (cap e.g. 3–5 per run)
4. For each URL (parallel, short timeout):
     a. SSRF guard (https only preferred; block private/link-local/metadata hosts)
     b. GET with User-Agent + size/time limits
     c. Strip HTML → plain text; keep title if easy; truncate to char budget
5. Append a “Linked pages” block to the prompt context (url + title + excerpt)
6. Existing AiProvider completes; response + meta (e.g. linksFetched / linksFailed)
7. UI unchanged except optional meta line (“Used N linked pages”) — no preview cards
```

**When it runs:** only inside AI Route Handlers / `run-ai` path — **not** on every chat send.

**Why AI-time only:** cheaper, no crawl farm, easier SSRF control, matches Path A “help me understand this conversation now.”

---

## 4. Prompt shape (illustrative)

```text
…existing transcript…

--- Linked pages (fetched for this request; may be incomplete) ---
[1] https://stackoverflow.com/questions/…
Title: …
Excerpt:
…

[2] https://…
(fetch failed — use chat text only for this link)
---
```

Model instructions stay Path A: ground answers in **provided** transcript + linked excerpts; admit gaps; never invent page content that wasn’t fetched.

---

## 5. Security (non-negotiable)

See also [SECURITY.md](./SECURITY.md).

1. **SSRF:** allow only public http(s); block localhost, RFC1918, link-local, cloud metadata (`169.254.169.254`), weird schemes (`file:`, `ftp:`).
2. **Timeouts + max bytes** on response body before parse.
3. **No cookies / no auth forwarding** from TeamHub session to third-party sites.
4. Treat fetched text as **untrusted** in the prompt (same as message bodies).
5. Rate limit already exists on AI routes — link fetches ride inside those calls (don’t add unbounded parallel crawls).

---

## 6. Suggested code shape (when implementing)

```text
lib/ai/
  extract-urls.ts      # find unique URLs in windowed bodies
  fetch-link-text.ts   # SSRF-safe fetch + HTML→text + caps
  link-context.ts      # orchestrate: extract → fetch → format block

Wire into message-context / run-ai after transcript is built, before provider.
```

No new public REST route required for V1 — existing `…/ai/*` endpoints gain richer context.

---

## 7. Product decisions (locked for V1)

| # | Decision |
|---|----------|
| 1 | **AI-time fetch only** — not on message send |
| 2 | **No UI preview cards** in V1 |
| 3 | Cap URLs + excerpt size; prefer recent / target-message URLs for Explain |
| 4 | Soft failure — AI still works without links |
| 5 | Same authz as chat; links from inaccessible channels never appear |
| 6 | V1.5 (large history / Ask sources / cache) stays a **separate** track |

---

## 8. Demo story (for later E2E)

1. Two members discuss a React hydration bug.
2. One pastes a Stack Overflow (or docs) URL + short comment.
3. Other uses **Explain** on that message (or **Ask**: “What fix did the link suggest?”).
4. Answer reflects the linked page’s relevant point — not only the raw URL.
5. Disconnect network to the URL host → AI still answers from chat; meta notes fetch failed.

---

[← README](./README.md) · [Stories →](./USER-STORIES.md) · [E2E →](./E2E-FLOWS.md) · [Tasks →](./TASKS.md)
