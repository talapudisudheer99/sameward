# Tasks — AI Knowledge Assistant (Phase 7 Path A)

## Slice 1 — Docs + locks

- [x] `docs/ai/*` vision, stories, E2E, API, FE, lib, security
- [x] Phase 7 README + progress pointer

## Slice 2 — Provider + context + summarize

- [x] `lib/ai` provider + OpenAI + message-context + prompts
- [x] `POST …/ai/summarize`

## Slice 3 — Catch me up + UI panel

- [x] `POST …/ai/catch-up`
- [x] Channel AI panel (summarize + catch-up)

## Slice 4 — Ask + Explain

- [x] `POST …/ai/ask` + `…/ai/explain`
- [x] Ask in panel; Explain on message

## Slice 5 — Draft reply

- [x] `POST …/ai/draft-reply`
- [x] Insert into composer (no auto-send)

## Slice 6 — Meeting notes

- [x] `POST …/ai/notes` + panel copy UX

## Slice 7 — Harden

- [x] Rate limit + `ai_runs` + timeouts
- [x] E2E checklist in docs; DoD below

## Definition of done (V1)

- [x] US-AI1…US-AI6 implemented (manual E2E with `OPENAI_API_KEY`)
- [x] Private isolation via `requireChannelAccess` (404)
- [x] Draft never auto-posts
- [x] Docs match shipped code

---

## V1.5 — Large history + contextual Ask + cache (next)

Direction: [CONVERSATION-UNDERSTANDING.md](./CONVERSATION-UNDERSTANDING.md) · stories US-AI7…US-AI9.

### Slice 8 — Docs lock for V1.5

- [x] Conversation understanding + Vision / README / stories updated (Aug 12)
- [ ] Break into implementation tickets when coding starts

### Slice 9 — Large-history Catch up (US-AI7)

- [ ] Chunk large `since` windows; extract team signals per chunk
- [ ] Merge into structured Catch up
- [ ] UI scope line (message count / segments)

### Slice 10 — Contextual Ask + sources (US-AI8)

- [ ] Candidate message find (keywords / filters / simple score — no embeddings)
- [ ] Small context → answer
- [ ] Show source messages in the panel

### Slice 11 — Cache Catch up / Summarize (US-AI9)

- [ ] Persist final results + validity metadata
- [ ] Reuse when still valid; refresh path when stale

### Definition of done (V1.5)

- [ ] US-AI7…US-AI9 pass manual E2E on a channel with 100+ messages in the window
- [ ] No vector DB; no workspace-wide overview; AI still never auto-posts
- [ ] Docs match shipped V1.5 behavior

---

[← Security](./SECURITY.md) · [README](./README.md)
