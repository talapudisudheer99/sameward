# AI Knowledge Assistant — module reference

**Status:** ✅ **Implemented + E2E verified** (Path A · OpenAI · Aug 10–11, 2026)  
**Customer goal:** Inside a channel you can already access, **understand** recent talk — summarize, catch up, ask, explain, draft, and turn discussion into editable notes — without the AI ever writing to the workspace for you.

**PO locks (Aug 10, 2026)**
1. **Path A only** — read-only knowledge assistant (no agents / tools that mutate data)
2. **Provider:** OpenAI behind `lib/ai/provider.ts` (swap later without rewriting routes)
3. **Authz:** same as chat — `requireChannelAccess` before any message reaches the model
4. **Context:** windowed messages (last N / `since`) — **no RAG / vector DB in v1**
5. **Writes:** AI never posts/edits; user may insert a draft into the composer and Send
6. **Notes:** returned as editable markdown in the UI — no Docs module yet

This folder is the **single source of truth** for the AI module (same idea as [`docs/channels/`](../channels/README.md)).

| Doc | Use when |
|-----|----------|
| [VISION.md](./VISION.md) | Why + in/out of scope |
| [USER-STORIES.md](./USER-STORIES.md) | PO stories + acceptance |
| [E2E-FLOWS.md](./E2E-FLOWS.md) | Flows + manual checklist |
| [API-ROUTES.md](./API-ROUTES.md) | REST under `…/channels/:id/ai/…` |
| [FRONTEND.md](./FRONTEND.md) | Panel, explain, draft insert |
| [LIB-AND-MODELS.md](./LIB-AND-MODELS.md) | `lib/ai/*`, schemas, `ai_runs` |
| [SECURITY.md](./SECURITY.md) | Keys, rate limit, injection |
| [TASKS.md](./TASKS.md) | Slice checklist |

---

[← Docs hub](../README.md) · [Phase 7 →](../phases/07-ai-integrations/README.md)
