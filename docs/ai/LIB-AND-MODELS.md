# Lib & models — AI

```text
lib/ai/
  constants.ts           # ✅ caps, model, rate limits
  provider.ts            # ✅ AiProvider interface
  openai-provider.ts     # ✅ OpenAI complete()
  prompts.ts             # ✅ system + capability prompts
  message-context.ts     # ✅ load + format + truncate
  rate-limit.ts          # ✅ per-user throttle
  run-ai.ts              # ✅ shared: access → context → provider → ai_runs
  ai-error-message.ts    # ✅ client RTK error helper
  extract-urls.ts        # ⬜ V1 link-context (planned)
  fetch-link-text.ts     # ⬜ SSRF-safe fetch + HTML→text
  link-context.ts        # ⬜ orchestrate excerpts into prompt

lib/schemas/ai/
  ai-request-schema.ts   # ✅

lib/models/ai/
  ai-run.ts              # ✅ audit

app/api/.../ai/*/route.ts  # ✅ summarize, catch-up, ask, explain, draft-reply, notes
store/api/ai/ai-api.ts     # ✅
components/channel/ai/     # ✅ panel + explain dialog
```

**Boundary:** Route Handlers call `lib/ai` only; browser never sees `OPENAI_API_KEY`.

**Link-context:** planned wire-in after transcript build, before provider — [LINK-CONTEXT.md](./LINK-CONTEXT.md).

---

## Status

✅ Path A V1 shipped Aug 10, 2026.  
📋 V1 link-context docs locked Aug 13, 2026 (code not started).

---

[← Frontend](./FRONTEND.md) · [Security →](./SECURITY.md)
