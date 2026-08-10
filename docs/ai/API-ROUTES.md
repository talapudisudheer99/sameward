# API routes — AI (Path A)

Base: `/api/workspaces/[workspaceId]/channels/[channelId]/ai/…`  
All require session + `requireChannelAccess`. Non-access → **404**.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `…/ai/summarize` | Summary of last N messages |
| POST | `…/ai/catch-up` | Summary since `since` |
| POST | `…/ai/ask` | Q&A over window |
| POST | `…/ai/explain` | Explain `messageId` + neighbors |
| POST | `…/ai/draft-reply` | Suggested reply text |
| POST | `…/ai/notes` | Structured meeting notes markdown |

### Shared success shape

```json
{
  "text": "…",
  "meta": {
    "messageCount": 42,
    "truncated": false,
    "since": null,
    "model": "gpt-4o-mini"
  }
}
```

### Request sketches

**summarize:** `{ "limit": 50 }` (optional; clamped)  
**catch-up:** `{ "since": "2026-08-09T00:00:00.000Z" }` (required ISO)  
**ask:** `{ "question": "…", "limit"?: 50, "since"?: "…" }`  
**explain:** `{ "messageId": "…" }`  
**draft-reply:** `{ "tone"?: "concise" | "friendly" | "formal", "limit"?: 40 }`  
**notes:** `{ "since"?: "…", "limit"?: 80 }`

### Errors

| Status | When |
|--------|------|
| 401 | No session |
| 404 | No channel access / message not in channel |
| 400 | Zod validation |
| 429 | Rate limited |
| 503 | Provider misconfigured / downtime (safe message) |

---

[← E2E](./E2E-FLOWS.md) · [Frontend →](./FRONTEND.md)
