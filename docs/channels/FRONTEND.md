# Frontend — Channels & chat

**Status:** UI shell landed (presentational) · RTK wiring is your assignment  
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

| Piece | Behavior (UI done) |
|-------|---------------------|
| Transcript | Bubbles + attachments; loading / error / empty; auto-scroll; `pending` / `failed` |
| Composer | Enter send · Shift+Enter newline · clear only on success · `isSending` |
| Attachments | Local chips; **upload in onSend** (S3 later — T12 text-only) |
| Typing | Parent passes `typingLabel` |
| Presence | `online` on `ChannelMemberRow` |
| Reconnect | `reconnecting` prop → banner |
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

## Client data (your work)

| Concern | Tool |
|---------|------|
| Channel list, CRUD, members | RTK Query → `store/api/channels-api.ts` |
| Message history / send | RTK Query in `store/api/channel/channel-api.ts` (T12) |
| Live append / typing / presence | Socket provider later (T13+) |
| Active channel id | URL `channelId` |

Shared types: `lib/types/channel/channel-types.ts` — align RTK response types with these.

---

## Mockups

| Reference | Status |
|-----------|--------|
| `channels-mockups-dialogs.png` | ✅ approved |
| Flow + desktop/mobile sheets | ⬜ optional |

---

[← Sockets](./SOCKETS.md) · [Lib & models →](./LIB-AND-MODELS.md)
