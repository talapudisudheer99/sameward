# Phase 7 — AI & Third-Party Integrations

**Status:** ✅ **Path A V1 shipped + E2E verified** (Aug 10–11, 2026) · ✅ **V1 link-context shipped** (Aug 13) · 🎯 **V1.5** next — module SoT: [`docs/ai/`](../../ai/README.md)  
**Prev:** [← Phase 6](../06-realtime/README.md) · **Next:** [Phase 8 — Quality →](../08-quality-deployment/README.md)

---

## PO locks (Aug 10, 2026) — V1 foundation

1. **Path A — Understand** (read-only knowledge assistant over channel messages)
2. **OpenAI** behind `lib/ai/provider.ts` (Gemini/Anthropic later)
3. Six capabilities: summarize · catch-up · ask · explain · draft reply · meeting notes
4. No agents/tools that mutate workspace data; no vector search in V1
5. Optional third-party “buy” integrations (Stripe, etc.) deferred

## V1 link-context locks (Aug 13, 2026) — ✅ shipped

1. AI-time fetch of public URLs found in the authorized message window
2. Short text excerpts into the prompt; soft-fail; SSRF + DNS pin
3. Chat OG cards are channels-owned — [LINK-PREVIEWS](../../channels/LINK-PREVIEWS.md); AI still fetches page text at request time
4. Story **US-AI10** — [`docs/ai/LINK-CONTEXT.md`](../../ai/LINK-CONTEXT.md)

## V1.5 locks (Aug 12, 2026) — next

1. Large-history Catch up (chunk → merge when needed)
2. Contextual Ask with **source messages** (DB find / simple scoring — no embeddings yet)
3. Cache expensive Catch-up / Summarize results
4. Per channel only; no workspace-wide overview
5. V2 later = persistent knowledge + stronger retrieval; no separate V3

Plain English: [`docs/ai/CONVERSATION-UNDERSTANDING.md`](../../ai/CONVERSATION-UNDERSTANDING.md)

Full vision, API, tasks: **[docs/ai/](../../ai/README.md)**

---

## Architecture (V1 today)

```
Client → POST /api/workspaces/.../channels/.../ai/*
      → requireChannelAccess
      → windowed messages → (optional) link excerpts → AiProvider (OpenAI)
      → { text, meta }  (never auto-writes messages)
```

V1 link-context: extract URLs → safe fetch → excerpts → then provider.  
V1.5 adds: large-window chunking, smarter Ask context selection + sources, result cache.

## Definition of done

V1: see [`docs/ai/TASKS.md`](../../ai/TASKS.md).  
V1 link-context: US-AI10 ✅.  
V1.5: US-AI7…US-AI9 when implemented.

See [docs/ai/TASKS.md](../../ai/TASKS.md) — all six capabilities E2E, private isolation, draft never auto-posts, docs match code.

---

[Docs hub](../../README.md)
