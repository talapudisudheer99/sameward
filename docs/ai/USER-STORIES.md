# User stories — AI Knowledge Assistant

Format: **As a… I want… So that…**  
**PO locks:** Aug 10, 2026 — see [VISION.md](./VISION.md)

---

## Epic

**As a** workspace member with channel access,  
**I want** AI help to understand conversation history,  
**So that** I catch up and respond faster without the AI changing workspace data for me.

---

## US-AI1 — Channel summary

**As a** channel member,  
**I want** a summary of recent messages,  
**So that** I grasp the thread without reading every line.

**Acceptance**
- [x] Entry from channel AI panel
- [x] Uses last N messages (capped); empty channel → clear empty state
- [x] Non-access → **404**

---

## US-AI2 — Catch me up

**As a** member returning after time away,  
**I want** a summary since a chosen time (yesterday / 7 days / custom ISO),  
**So that** I only review what I missed.

**Acceptance**
- [x] `since` required (ISO); presets set it client-side
- [x] Only messages with `createdAt >= since`
- [x] Truncation note when window exceeds caps

---

## US-AI3 — Ask about conversations

**As a** member,  
**I want** to ask a question over messages I’m allowed to see,  
**So that** I get grounded answers (or “not in the provided messages”).

**Acceptance**
- [x] Question required; answer cites only provided context
- [x] Private isolation identical to chat

---

## US-AI4 — Explain a message

**As a** member,  
**I want** context/explanation for one message,  
**So that** cryptic lines make sense from nearby talk.

**Acceptance**
- [x] Action on a message in the transcript
- [x] Loads target + ±K neighbors in same channel
- [x] Wrong channel / missing → **404**

---

## US-AI5 — Draft a reply

**As a** member,  
**I want** a suggested reply in the composer,  
**So that** I can edit and Send myself.

**Acceptance**
- [x] Draft inserted into composer — **never** auto-POSTed
- [x] Optional tone hint

---

## US-AI6 — Meeting notes

**As a** member,  
**I want** structured notes (summary, decisions, action items) as markdown,  
**So that** I can copy/edit them outside chat.

**Acceptance**
- [x] Panel shows editable/copyable markdown
- [x] No automatic Docs collection write

---

## V1 link-context (shipped)

See [USER-STORIES.md](./USER-STORIES.md) US-AI10.

### US-AI10 — Read shared links for AI context

**As a** channel member discussing work with pasted URLs (docs, Stack Overflow, GitHub, …),  
**I want** Channel AI (Explain / Catch up / Ask / Summarize / Draft / Notes) to use short excerpts from those public pages,  
**So that** answers reflect what we linked — not only the raw URL string.

**Acceptance**
- [x] URLs extracted from the **authorized** AI message window only
- [x] Fetch runs **on AI request** (not on every chat send)
- [x] Cap URLs + excerpt size; timeouts; soft-fail → AI still runs on chat text
- [x] SSRF-safe fetch (no private IPs / metadata / weird schemes)
- [x] Response meta: links fetched / failed (OG cards are channels — see LINK-PREVIEWS)
- [x] Private-channel isolation unchanged (**404** for outsiders)
- [x] AI still never auto-posts

**Out of this story**
- Chat OG unfurl polish beyond what channels already ship ([LINK-PREVIEWS](../channels/LINK-PREVIEWS.md))
- Login-walled / paywalled content, PDFs, screenshots OCR

---

## V1.5 stories (planned — next after link-context)

See [CONVERSATION-UNDERSTANDING.md](./CONVERSATION-UNDERSTANDING.md).

### US-AI7 — Large-history Catch up

**As a** member returning after many messages,  
**I want** Catch up to handle a large “since I left” window without dumping every message into the AI at once,  
**So that** I get a clear return-to-work summary (decisions, progress, open items, mentions).

**Acceptance**
- [ ] Small window → one AI pass (same spirit as V1)
- [ ] Large window → chunk → summarize (team signals) → merge → final Catch up
- [ ] UI shows how many messages / segments were analyzed
- [ ] Still **per channel** only; never auto-posts

### US-AI8 — Contextual Ask with sources

**As a** member who just caught up,  
**I want** to ask a follow-up question and see **which messages** the answer came from,  
**So that** I can verify the AI found the right moment in the conversation.

**Acceptance**
- [ ] Finds candidate messages with search / filters / simple scoring (no vector DB in V1.5)
- [ ] Sends a small context window to the AI
- [ ] Answer includes visible source messages (or clear “not found in this channel”)
- [ ] Same channel access rules as chat (404 when no access)

### US-AI9 — Cache Catch up / Summarize

**As a** member (and as the product),  
**I want** expensive Catch up / Summarize results reused when the same window is still valid,  
**So that** we don’t pay to regenerate the same answer for no reason.

**Acceptance**
- [ ] Stores final result + metadata (user, channel, type, time range, message count, last message id, created at, text)
- [ ] Reuses when still valid; regenerates when the window moved or content changed
- [ ] User can still force a fresh run (product detail TBD)

---

[← Vision](./VISION.md) · [E2E →](./E2E-FLOWS.md)
