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

lib/schemas/ai/
  ai-request-schema.ts   # ✅

lib/models/ai/
  ai-run.ts              # ✅ audit

app/api/.../ai/*/route.ts  # ✅ summarize, catch-up, ask, explain, draft-reply, notes
store/api/ai/ai-api.ts     # ✅
components/channel/ai/     # ✅ panel + explain dialog
```

**Boundary:** Route Handlers call `lib/ai` only; browser never sees `OPENAI_API_KEY`.

---

## Status

✅ Shipped Aug 10, 2026 (Path A).

---

[← Frontend](./FRONTEND.md) · [Security →](./SECURITY.md)
