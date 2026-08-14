# Link preview cards (OG unfurl)

**Status:** ✅ Shipped (Aug 13, 2026)  
**UI:** `components/channel/link-preview-card.tsx`  
**Fetch:** `lib/channels/og-preview.ts` (reuses SSRF-safe `fetchPublicHtml`)

## Behavior

1. On **POST/PATCH message**, extract up to **2** `http(s)` URLs from the body.
2. Server fetches HTML (DNS pin + private IP block — same path as AI link-context).
3. Parse Open Graph / Twitter / `<title>` / description / image / favicon.
4. Store on `message.linkPreviews`; return in message JSON.
5. If fetch exceeds ~2.2s budget, respond without cards then **`message:update`** when ready.
6. Transcript: **one attached unit** — OG card on top, text bubble below (shared width). Link-only bodies show the card alone.
7. Soft delete clears `linkPreviews`.
8. **Composer:** while typing a URL, a live preview appears above the input (dismiss with ✕). Same SSRF-safe fetch via `POST …/link-preview`.

## Out of scope

- Previewing non-http URLs (`example.com` without scheme)  
- Storing page HTML in Mongo  
- Login-walled / PDF / OCR content  

## Code map

```text
lib/types/channel/link-preview.ts     # shared LinkPreview type
lib/channels/og-preview.ts            # parse + resolve (+ budget)
lib/channels/finalize-link-previews.ts # background message:update
lib/schemas/channel/link-preview-schema.ts
components/channel/link-preview-card.tsx
hooks/channels/use-composer-link-preview.ts
POST …/channels/:channelId/link-preview
```

## Manual check

Send `https://www.wikipedia.org/` or `https://example.com/` → card with title (image when site provides `og:image`). Network response should include `linkPreviews: [...]`.

---

[← Channels README](./README.md) · [Data model](./DATA-MODEL.md)
