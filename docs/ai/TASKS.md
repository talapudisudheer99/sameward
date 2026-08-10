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

## Definition of done

- [x] US-AI1…US-AI6 implemented (manual E2E with `OPENAI_API_KEY`)
- [x] Private isolation via `requireChannelAccess` (404)
- [x] Draft never auto-posts
- [x] Docs match shipped code

---

[← Security](./SECURITY.md) · [README](./README.md)
