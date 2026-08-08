# Frontend — Channels & chat

**Status:** ✅ **Wired & shipped** — UI + RTK Query + live sockets + S3 attachments (E2E verified 2026-08-09)  
**Routes:** `/workspace/[workspaceId]/channels` · `/workspace/[workspaceId]/channels/[channelId]`

---

## Screens

| Code | Screen | Component | Status |
|------|--------|-----------|--------|
| **Ch-A** | Channel list sidebar | `components/channel/channel-sidebar.tsx` | ✅ UI |
| **Ch-B** | Empty / tip | `channel-empty-tip.tsx` | ✅ UI |
| **Ch-C** | Create channel dialog | `dialogs/channel/create-channel-dialog.tsx` | ✅ UI |
| **Ch-D** | Chat + composer | `chat-header` · `chat-message-list` · `chat-composer` · shell | ✅ UI |
| **Ch-E** | Private members panel | `channel-members-panel.tsx` | ✅ UI |
| **Ch-F** | Invite to private | `invite-channel-members-dialog.tsx` | ✅ UI |
| — | Rename / delete | `rename-channel-dialog` · `ConfirmDialog` | ✅ UI |
| — | Typing / reconnect | `typing-indicator` · `reconnect-banner` | ✅ UI (props only) |

**Shell:** `components/channel/channel-chat-shell.tsx` — all data via props + callbacks. No RTK inside.

**Page stubs:** `app/(app)/workspace/[workspaceId]/channels/...` — toast placeholders until you wire RTK.

---

## Chat UI building blocks

| Piece | Behavior (shipped) |
|-------|---------------------|
| Transcript | Grouped bubbles hug content; attachments (image grid + lightbox + file cards); loading / error / empty; auto-scroll; `pending` / `failed` (`chat-message-list.tsx`, `chat-attachments.tsx`) |
| Composer | Enter send · Shift+Enter newline · clear only on success · `isSending` · disabled while uploading |
| Attachments | Local chips → **lazy presign + parallel S3 PUT in onSend**, then message POST (`lib/storage/upload-client.ts`) |
| Typing | `use-channel-typing` → `typingLabel` |
| Presence | `user-workspace-presence` → `online` on `ChannelMemberRow` |
| Reconnect | `reconnecting` prop → banner + gap fetch |
| Emoji | Button stub (disabled) — optional later |

**Not v1 UI:** thread panel, reaction picker, DM inbox.

---

## Role-gated CTAs

| CTA | Visible when |
|-----|--------------|
| Create channel | `canManage` (owner \| admin) |
| Invite / remove private members | `canManage` + private channel |
| Rename / delete | `canManage` (delete hidden if `isDefault`) |
| Post / attach | anyone with channel access (gate in API) |

---

## Client data (shipped)

| Concern | Tool |
|---------|------|
| Channel list, CRUD, members | RTK Query → `store/api/workspace/workspaces-api.ts` |
| Message history / send | RTK Query → `store/api/channel/channel-api.ts` |
| Attachment presign | RTK Query → `store/api/upload/upload-api.ts` |
| Live append / typing / presence | `components/providers/socket-provider.tsx` + hooks |
| Active channel id | URL `channelId` |

Shared types: `lib/types/channel/channel-types.ts` + `lib/types/upload/upload-types.ts`.

---

## Mockups

| Reference | Status |
|-----------|--------|
| `channels-mockups-dialogs.png` | ✅ approved |
| Flow + desktop/mobile sheets | ⬜ optional |

---

[← Sockets](./SOCKETS.md) · [Lib & models →](./LIB-AND-MODELS.md)
