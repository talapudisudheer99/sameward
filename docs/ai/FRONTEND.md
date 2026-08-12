# Frontend — AI Knowledge Assistant

**Routes:** same channel page — `/workspace/[workspaceId]/channels/[channelId]`

| Piece | Behavior |
|-------|----------|
| Header “AI” button | Opens `ChannelAiPanel` (dialog) |
| Panel tabs/actions | Summarize · Catch up · Ask · Draft · Notes |
| Message “Explain” | Per-message action → explain dialog (filenames only for attachments — no vision/OCR in v1) |
| Draft insert | Sets composer body via `draftNonce` / `draftText`; user must Send |
| Loading / errors | Spinner + toast; 429 / 503 / empty-teammate draft copy |
| Dialogs | Light `bg-card` surfaces; responsive `max-w` for phone |

**Data:** RTK `store/api/ai/ai-api.ts` mutations (no cache tags required).

**Shell:** presentational pieces under `components/channel/ai/`; page wires mutations + composer draft state.

---

[← API](./API-ROUTES.md) · [Lib →](./LIB-AND-MODELS.md)
