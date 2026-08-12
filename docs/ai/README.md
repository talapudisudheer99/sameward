# AI Knowledge Assistant — module reference

**Status:** ✅ **Path A V1 shipped + E2E verified** (Aug 10–11, 2026) · 🎯 **V1.5 next** (large-history Catch up + contextual Ask + cache)  
**Customer goal:** Inside a channel you can already access, **understand** talk — including after a long absence — without the AI ever writing to the workspace for you.

**PO locks (foundation · Aug 10)**
1. **Path A only** — read-only knowledge assistant (no agents / tools that mutate data)
2. **Provider:** OpenAI behind `lib/ai/provider.ts`
3. **Authz:** same as chat — `requireChannelAccess` before any message reaches the model
4. **Writes:** AI never posts/edits; user may insert a draft into the composer and Send
5. **Notes:** returned as editable markdown in the UI — no Docs module yet
6. **Per channel only** — no workspace-wide overview through V2

**PO locks (V1.5 · Aug 12)** — see [CONVERSATION-UNDERSTANDING.md](./CONVERSATION-UNDERSTANDING.md)  
1. Large-history Catch up: small → one pass; large → chunk → summarize → merge  
2. Contextual Ask: find relevant messages → small context → answer **+ sources** (no vector DB yet)  
3. Cache final Catch-up / Summarize results with validity metadata  
4. V2 = persistent knowledge + stronger retrieval later; no separate “V3”

This folder is the **single source of truth** for the AI module (same idea as [`docs/channels/`](../channels/README.md)).

| Doc | Use when |
|-----|----------|
| [VISION.md](./VISION.md) | Why + in/out of scope + PO locks |
| [CONVERSATION-UNDERSTANDING.md](./CONVERSATION-UNDERSTANDING.md) | Leave scenario, V1 → V1.5 → V2 (plain English) |
| [USER-STORIES.md](./USER-STORIES.md) | PO stories + acceptance |
| [E2E-FLOWS.md](./E2E-FLOWS.md) | Flows + manual checklist |
| [API-ROUTES.md](./API-ROUTES.md) | REST under `…/channels/:id/ai/…` |
| [FRONTEND.md](./FRONTEND.md) | Panel, explain, draft insert |
| [LIB-AND-MODELS.md](./LIB-AND-MODELS.md) | `lib/ai/*`, schemas, `ai_runs` |
| [SECURITY.md](./SECURITY.md) | Keys, rate limit, injection |
| [TASKS.md](./TASKS.md) | Slice checklist (V1 done · V1.5 planned) |

---

[← Docs hub](../README.md) · [Phase 7 →](../phases/07-ai-integrations/README.md)
