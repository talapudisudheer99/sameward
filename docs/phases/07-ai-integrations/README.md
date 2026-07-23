# Phase 7 — AI & Third-Party Integrations

**Status:** ⬜ Not started  
**Prev:** [← Phase 6](../06-realtime/README.md) · **Next:** [Phase 8 — Quality →](../08-quality-deployment/README.md)

---

## 1. Business requirement

AI should earn its place: e.g. summarize a channel, draft a doc, suggest card titles. Other vendors handle hard infrastructure (email, images, payments).

## 2. What you will build (pick with mentor)

- AI summarize / draft via OpenAI or Gemini (server-side key)
- Optional: Cloudinary uploads, Resend email invites, Stripe test mode, GitHub OAuth

## 3. Architecture

```
Client → POST /api/ai/summarize
      → Route Handler (auth + rate limit mindset)
      → Provider SDK
      → Never expose API keys to browser
```

## 4. Why buy vs build

| Build yourself | Buy a service |
|----------------|---------------|
| Core product differentiator | Undifferentiated heavy lifting |
| Learning exercise | Email deliverability, card PCI, ML infra |

## 5. Concepts covered

- [ ] Env vars & secrets
- [ ] Server-only keys
- [ ] Timeouts / retries / user-facing errors
- [ ] Cost & abuse awareness
- [ ] Webhooks (Stripe/Resend) concepts

## 6. Folder structure (target)

```
app/api/ai/...
lib/ai/provider.ts
```

## 7. Backend (Next + MongoDB)

- Log AI jobs optionally in Mongo (`ai_runs`) for debugging
- Still authorize against workspace membership

## 8. Micro-tasks

Mentor picks one integration first (usually AI summarize).

## 9. Testing & production notes

- Mock provider in tests
- Rate limit sensitive routes

## 10. Interview questions (preview)

1. Why must LLM API keys stay on the server?
2. How do you handle provider downtime in UX?
3. What is a webhook and how do you verify it?

## 11. Definition of done

One integration works end-to-end with secure key handling; you can defend why that service was chosen.

---

[Docs hub](../../README.md)
