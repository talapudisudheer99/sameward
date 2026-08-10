# Frontend — AI Knowledge Assistant

**Routes:** same channel page — `/workspace/[workspaceId]/channels/[channelId]`

| Piece | Behavior |
|-------|----------|
| Header “AI” button | Opens `ChannelAiPanel` (sheet/dialog) |
| Panel tabs/actions | Summarize · Catch up · Ask · Draft · Notes |
| Message “Explain” | Per-message action → explain dialog |
| Draft insert | Sets composer body; user must Send |
| Loading / errors | Spinner + toast or inline error; 429 / 503 copy |

**Data:** RTK `store/api/ai/ai-api.ts` mutations (no cache tags required).

**Shell:** presentational pieces under `components/channel/ai/`; page wires mutations + composer draft state.

---

[← API](./API-ROUTES.md) · [Lib →](./LIB-AND-MODELS.md)
