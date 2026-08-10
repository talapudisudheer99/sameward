# Phase 7 — AI & Third-Party Integrations

**Status:** ✅ **Path A shipped** — module SoT: [`docs/ai/`](../../ai/README.md)  
**Prev:** [← Phase 6](../06-realtime/README.md) · **Next:** [Phase 8 — Quality →](../08-quality-deployment/README.md)

---

## PO locks (Aug 10, 2026)

1. **Path A — Understand** (read-only knowledge assistant over channel messages)
2. **OpenAI** behind `lib/ai/provider.ts` (Gemini/Anthropic later)
3. Six capabilities: summarize · catch-up · ask · explain · draft reply · meeting notes
4. No agents/tools that mutate workspace data; no RAG in v1
5. Optional third-party “buy” integrations (Stripe, etc.) deferred

Full vision, API, tasks: **[docs/ai/](../../ai/README.md)**

---

## Architecture

```
Client → POST /api/workspaces/.../channels/.../ai/*
      → requireChannelAccess
      → windowed messages → AiProvider (OpenAI)
      → { text, meta }  (never auto-writes messages)
```

## Definition of done

See [docs/ai/TASKS.md](../../ai/TASKS.md) — all six capabilities E2E, private isolation, draft never auto-posts, docs match code.

---

[Docs hub](../../README.md)
