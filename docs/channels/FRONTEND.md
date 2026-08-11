# Frontend — Channels & chat

**Status:** ✅ **Wired & shipped** — UI + RTK Query + live sockets + S3 attachments  
**E2E:** verified 2026-08-09 · UI polish + mobile channel picker verified 2026-08-11  
**Routes:** `/workspace/[workspaceId]/channels` · `?list=1` (mobile picker) · `/workspace/[workspaceId]/channels/[channelId]`

---

## Screens

| Code | Screen | Component | Status |
|------|--------|-----------|--------|
| **Ch-A** | Channel list sidebar | `components/channel/channel-sidebar.tsx` | ✅ UI |
| **Ch-A′** | Mobile channel picker | `app/.../channels/page.tsx` (`?list=1` / &lt;md) | ✅ UI |
| **Ch-B** | Empty / tip | `channel-empty-tip.tsx` | ✅ UI |
| **Ch-C** | Create channel dialog | `dialogs/channel/create-channel-dialog.tsx` | ✅ UI |
| **Ch-D** | Chat + composer | `chat-header` · `chat-message-list` · `chat-composer` · shell | ✅ UI |
| **Ch-E** | Private members panel | `channel-members-panel.tsx` | ✅ UI |
| **Ch-F** | Invite to private | `invite-channel-members-dialog.tsx` | ✅ UI |
| — | Rename / delete | `rename-channel-dialog` · `ConfirmDialog` | ✅ UI |
| — | Typing / reconnect | `typing-indicator` · `reconnect-banner` | ✅ UI (props only) |
| — | Channel AI | `components/channel/ai/*` | ✅ → [docs/ai](../ai/FRONTEND.md) |
| — | Start DM | `dialogs/channel/start-dm-dialog.tsx` | ✅ UI |
| — | Unread badges | sidebar + DM list | ✅ UI |
| — | @mentions | composer autocomplete + transcript | ✅ UI |

**Shell:** `components/channel/channel-chat-shell.tsx` — all data via props + callbacks. No RTK inside.

**Page:** `app/(app)/workspace/[workspaceId]/channels/[channelId]/page.tsx` wires RTK + sockets + uploads + DMs/unread.

**Helpers:** `lib/channels/chat-ui-helpers.ts` — `dmListItemToChannel`, `resolveMentionCandidates`.

---

## Responsive (tablet / phone)

| Breakpoint | Behavior |
|------------|----------|
| **&lt; md** (phone) | In a channel: sidebar **hidden**; header **←** → `/channels?list=1` full-screen picker. App `MobileNav` is **hidden** on channel routes (picker/chat headers only — no double bar). |
| **md–lg** (tablet) | Channel list + chat side-by-side; members panel is an **overlay** (not a permanent third column). |
| **≥ lg** | Members panel can dock beside chat when opened. |

Desktop `/channels` (no `?list=1`) still auto-opens default/`#general`.

---

## Chat UI building blocks

| Piece | Behavior (shipped) |
|-------|---------------------|
| Transcript | Grouped bubbles hug content; `min-w-0` + wrap; loading / error / empty; auto-scroll; `pending` / `failed` |
| Attachments | Image **1/2/3 grid** (stack on narrow); click → **light card lightbox** (prev/next, open, download); PDF/file cards with truncated names (`chat-attachments.tsx`) |
| Composer | Enter send · Shift+Enter newline · clear only on success · `isSending` · disabled while uploading · AI draft insert via `draftNonce` |
| Typing | `use-channel-typing` → `typingLabel` |
| Presence | `user-workspace-presence` → `online` on `ChannelMemberRow` |
| Reconnect | `reconnecting` prop → banner + gap fetch |
| Emoji | Composer insert + message reaction picker (`EmojiPicker` allowlist) |
| Reactions | Hover SmilePlus · chips under bubble (toggle; highlight if you reacted) |
| Edit / delete | Hover Pencil/Trash · inline edit · confirm delete · tombstone |

**Not v1 UI:** thread panel, group DM inbox. Profile card → [profiles](../profiles/README.md).

---

## Role-gated CTAs

| CTA | Visible when |
|-----|--------------|
| Create channel | `canManage` (owner \| admin) |
| Invite / remove private members | `canManage` + private channel |
| Rename / delete | `canManage` (delete hidden if `isDefault`) |
| Post / attach | anyone with channel access (gate in API) |
| AI panel / Explain | channel members (same access as chat) |

---

## Client data (shipped)

| Concern | Tool |
|---------|------|
| Channel list, CRUD, members | RTK Query → `store/api/channel/channel-api.ts` (+ workspace members for invite) |
| Message history / send | RTK Query → `store/api/channel/channel-api.ts` |
| Attachment presign | RTK Query → `store/api/upload/upload-api.ts` |
| AI mutations | RTK Query → `store/api/ai/ai-api.ts` |
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
