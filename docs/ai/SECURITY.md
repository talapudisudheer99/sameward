# Security — AI Knowledge Assistant

| Rule | Detail |
|------|--------|
| Keys | `OPENAI_API_KEY` server-only; never `NEXT_PUBLIC_` |
| Authz | `requireChannelAccess` before loading messages |
| Isolation | Model context built only from that query — no cross-channel bleed |
| Caps | Max messages + max chars; truncate oldest first |
| Rate limit | Per user (e.g. 30/hour) → 429 |
| Prompt | Ground answers in provided messages; admit gaps |
| Injection | Read-only Path A limits blast radius; still treat message bodies as untrusted data inside the prompt |
| Errors | No raw provider stack traces to client |
| Link fetch (V1) | SSRF guards + DNS pin; https/http only; block private/link-local/metadata hosts; timeout + max bytes; no session cookies forwarded; treat fetched HTML/text as untrusted — [LINK-CONTEXT.md](./LINK-CONTEXT.md) |

**Key principle:** “Authorization happens before retrieval; the LLM is not a permission system.”

---

[← Lib](./LIB-AND-MODELS.md) · [Tasks →](./TASKS.md)
