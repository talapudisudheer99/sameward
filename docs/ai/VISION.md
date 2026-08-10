# Vision — AI Knowledge Assistant (Path A)

## One-line vision

A channel is where the team talks; **AI helps you understand that talk** — summaries, catch-up, Q&A, explanations, draft replies, and meeting notes — without acting on your behalf.

## Mission

After live chat + files, members still ask: *“What did I miss?”* and *“What was decided?”*  
Path A answers those questions over **authorized** message history.

---

## Why this module (customer problem)

Without AI:
- Catching up means scrolling hundreds of messages.
- Context for a cryptic message lives only in neighbors’ heads.
- Turning a long thread into notes is manual copy-paste.

With Path A:
- Summarize recent discussion or a time window.
- Ask grounded questions; get “I don’t know” when context lacks the answer.
- Explain one message using nearby context.
- Draft a reply the **user** still sends.
- Generate structured notes the user can copy/edit.

**Emotion after v1:** *“I understand this channel faster,”* not *“an agent ran my workspace.”*

---

## PO locks (Aug 10, 2026)

| # | Decision |
|---|----------|
| 1 | **Path A — Understand** (read-only). Path B agents deferred |
| 2 | **OpenAI** as first provider; abstract via `AiProvider` |
| 3 | Server-side key only (`OPENAI_API_KEY` — never `NEXT_PUBLIC_`) |
| 4 | Context = **windowed Mongo messages** (cap count + chars); no embeddings |
| 5 | Attachments in context as `[file: name]` stubs — no OCR/PDF parse |
| 6 | AI responses never auto-persist as channel messages or docs |

---

## What “done” means (v1 scope)

**In scope**
- Channel summary (last N)
- Catch me up (`since` ISO / presets)
- Ask over authorized window
- Explain a specific message (± neighbors)
- Draft reply → composer insert → user Send
- Meeting notes (structured markdown in panel)
- Rate limit + optional `ai_runs` audit
- Private-channel isolation (same 404 as chat)

**Out of scope**
- Tool-calling agents that create channels, invite, post, delete
- RAG / vector search
- Docs/boards persistence module
- Streaming SSE (optional polish later; v1 = JSON)
- Multi-provider picker UI
- Stripe / Cloudinary / other “buy” integrations

---

[← README](./README.md) · [User stories →](./USER-STORIES.md)
