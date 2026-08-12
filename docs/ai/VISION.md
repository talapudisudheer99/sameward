# Vision — AI Knowledge Assistant (Path A)

## One-line vision

A channel is where the team talks; **AI helps you understand that talk** — summaries, catch-up, Q&A, explanations, draft replies, and meeting notes — without acting on your behalf.

## Mission

After live chat + files, members still ask: *“What did I miss?”* and *“What was decided?”*  
Path A answers those questions over **authorized** message history — and, in V1.5, over **large** history without dumping every message into the model.

---

## Why this module (customer problem)

Without AI:
- Catching up means scrolling hundreds of messages.
- Context for a cryptic message lives only in neighbors’ heads.
- Turning a long thread into notes is manual copy-paste.

With Path A:
- Summarize recent discussion or a time window.
- Catch up after time away (V1 limited window → **V1.5 large history**).
- Ask grounded questions; in V1.5, find the right moment and show **source messages**.
- Explain one message using nearby context.
- Draft a reply the **user** still sends.
- Generate structured notes the user can copy/edit.

**Emotion:** *“I understand this channel faster,”* not *“an agent ran my workspace.”*

---

## PO locks

### Path A foundation (Aug 10, 2026)

| # | Decision |
|---|----------|
| 1 | **Path A — Understand** (read-only). Path B agents deferred |
| 2 | **OpenAI** as first provider; abstract via `AiProvider` |
| 3 | Server-side key only (`OPENAI_API_KEY` — never `NEXT_PUBLIC_`) |
| 4 | Attachments in context as `[file: name]` stubs — no OCR/PDF parse |
| 5 | AI responses never auto-persist as channel messages or docs |
| 6 | AI stays **per channel** — no workspace-wide mega-summary (V1–V2) |

### V1.5 locks (Aug 12, 2026) — next to build

| # | Decision |
|---|----------|
| 1 | **Large-history Catch up:** small window → one pass; large → chunk → summarize → merge |
| 2 | Chunks extract team signals (decisions, progress, open questions, actions, mentions, …) |
| 3 | **Contextual Ask:** find relevant messages → small context → answer **+ show sources** |
| 4 | Find messages with DB search / filters / simple scoring — **no vector DB / embeddings yet** |
| 5 | **Cache** final Catch-up / Summarize results with validity metadata |
| 6 | “Find the right moment” lives in **V1.5** (not a separate V3) |
| 7 | **V2 later:** persistent conversation knowledge + stronger retrieval if usage proves need |

Full plain-English write-up: [CONVERSATION-UNDERSTANDING.md](./CONVERSATION-UNDERSTANDING.md).

---

## What “done” means

### V1 (shipped)

**In scope**
- Channel summary (last N)
- Catch me up (`since` ISO / presets) on a **capped** window
- Ask over authorized window
- Explain a specific message (± neighbors)
- Draft reply → composer insert → user Send
- Meeting notes (structured markdown in panel)
- Rate limit + optional `ai_runs` audit
- Private-channel isolation (same 404 as chat)

**Out of scope for V1**
- Tool-calling agents that create channels, invite, post, delete
- Vector search / embeddings
- Large-history chunk → merge Catch up
- Cached Catch-up / Summarize results
- Docs/boards persistence module

### V1.5 (next)

**In scope**
- Large-history Catch up (chunk → merge when needed)
- Contextual Ask with source messages (limited find — no embeddings)
- Cache expensive Catch-up / Summarize results
- Honest UI scope (“based on N messages…”, sources list)

**Still out of scope**
- Vector database / embeddings for every message
- Background workers building permanent memory
- Workspace-wide overview
- Agents that mutate the workspace

### V2 (later)

Persistent per-channel conversation knowledge and stronger retrieval — only after we see real use of V1.5.

---

[← README](./README.md) · [Conversation understanding →](./CONVERSATION-UNDERSTANDING.md) · [User stories →](./USER-STORIES.md)
