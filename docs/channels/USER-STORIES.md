# User stories — Channels & realtime chat

Format: **As a… I want… So that…**  
Acceptance = what we demo for v1.

**PO locks:** Jul 31, 2026 — see [VISION.md](./VISION.md)  
**Status:** ✅ **Implemented** (channels v1 + unread + 1:1 DMs + @mentions)

---

## Epic

**As a** workspace member,  
**I want** public and private channels with live messages,  
**So that** my team can discuss work in Sameward without refreshing or leaving for Slack.

---

## US-C1 — Default `#general`

**As a** workspace owner creating a team space,  
**I want** a default public `#general` channel,  
**So that** people can talk immediately without an empty shell.

**Acceptance**
- [ ] Creating a workspace also creates `#general` (`isDefault`, `visibility: public`)
- [ ] Opening a workspace with zero channels lazy-creates `#general` once
- [ ] Soft tip / empty guidance: owner/admin can create more channels
- [ ] Members land in `#general` (or last-opened later — v1: `#general`)

---

## US-C2 — Create channel (owner/admin)

**As an** owner or admin,  
**I want** to create a public or private channel with a name,  
**So that** discussion has the right audience.

**Acceptance**
- [ ] Only owner/admin see Create channel; API **403** otherwise
- [ ] Body includes `name` + `visibility: public | private`
- [ ] Public: all workspace members can list/open
- [ ] Private: creator becomes channel member; others need invite
- [ ] Member role cannot create
- [ ] Invalid name → Zod **400**

---

## US-C3 — List & open channels

**As a** workspace member,  
**I want** to see channels I’m allowed to access,  
**So that** I never discover private spaces I’m not in.

**Acceptance**
- [ ] List = public channels in workspace **plus** private channels where I have channel membership
- [ ] Open non-allowed / missing → **404** (no existence leak for private)
- [ ] Sidebar shows name + visibility cue (e.g. lock icon for private)

---

## US-C4 — Invite to private channel

**As an** owner/admin (or private-channel creator — **lock: owner/admin of workspace** for v1),  
**I want** to add existing workspace members to a private channel,  
**So that** the right subset can talk.

**Acceptance**
- [ ] Can only invite users who already have **workspace** membership
- [ ] Creates `ChannelMembership` (not workspace invite email flow)
- [ ] Non-members of workspace → fail clearly
- [ ] Already in channel → idempotent / failed reason
- [ ] Member without permission → **403**

---

## US-C5 — Send & receive text messages (realtime)

**As a** channel member,  
**I want** to send a text message and see others’ messages live,  
**So that** chat feels instant.

**Acceptance**
- [ ] `POST` message persists to Mongo; returns message JSON
- [ ] Socket emits `message:new` to `channel:{id}` after successful write
- [ ] Second browser in same channel sees message without refresh
- [ ] History loads via `GET` with cursor pagination
- [ ] Empty text rejected; max length enforced (e.g. 4000 chars)
- [ ] Reconnect: client rejoins room + can refetch since last id/time

---

## US-C6 — Attach files (limited)

**As a** channel member,  
**I want** to attach allowed images/PDFs to a message,  
**So that** I can share a screenshot or document in context.

**Acceptance**
- [ ] Max **10 MB** / file · max **3** files / message
- [ ] MIME allowlist only (jpeg/png/webp/gif/pdf)
- [ ] Reject others with clear error
- [ ] Upload via REST → object storage → message stores attachment metadata/URLs
- [ ] Live peers receive message including attachment metadata over socket
- [ ] UI shows upload states (idle/uploading/error/done)

---

## US-C7 — Typing indicator

**As a** channel member,  
**I want** to see when someone is typing,  
**So that** conversation feels alive.

**Acceptance**
- [ ] Client emits throttled `typing:start` / auto-stop
- [ ] Peers show “X is typing…” (no persistence)
- [ ] Stopped after timeout or on `message:new` from that user

---

## US-C8 — Basic presence

**As a** workspace member in chat,  
**I want** to see who is online,  
**So that** I know who might reply now.

**Acceptance**
- [ ] Socket presence for workspace room (online/offline)
- [ ] UI shows online state on member list / header (simple)
- [ ] Disconnect / leave marks offline within a short grace if needed
- [ ] Not a full activity feed or “last seen” history product

---

## US-C9 — Tenant + channel isolation

**As a** customer,  
**I want** channel and message data unreachable across tenants / private boundaries,  
**So that** chat is safe.

**Acceptance**
- [ ] Guessing ids → **404** when not allowed
- [ ] Socket join denied without authz (disconnect or error event)
- [ ] Documented in [SECURITY.md](./SECURITY.md)

---

## US-C10 — Unread + catch-up

**As a** workspace member,  
**I want** unread counts and a clear “since I left” window,  
**So that** Channel AI catch-up and the sidebar match what I actually missed.

**Acceptance**
- [x] Opening a channel marks it read (`POST …/read`); own messages never count as unread
- [x] Sidebar shows unread badge; list API returns `unreadCount` + `lastReadAt`
- [x] Catch up can scope to “Since last visit”

---

## US-C11 — 1:1 DMs

**As a** workspace member,  
**I want** a private 1:1 conversation with another member,  
**So that** I can talk without creating a named channel.

**Acceptance**
- [x] `GET/POST …/dms` find-or-create; pair unique per workspace (`dmPairKey`)
- [x] DMs excluded from channel list; shown in a DM sidebar section
- [x] Same messages, unread, typing, and Channel AI as channels

---

## US-C12 — @mentions

**As a** channel or DM participant,  
**I want** to @mention teammates when composing,  
**So that** messages call out the right people.

**Acceptance**
- [x] Composer `@` autocomplete from allowed members (workspace / private / DM peer)
- [x] `mentionedUserIds` persisted and highlighted in the transcript

---

## US-C13 — Emoji reactions

**As a** channel or DM participant,  
**I want** to react to messages with a small set of emoji,  
**So that** I can acknowledge without cluttering the transcript.

**Acceptance**
- [x] Hover / React opens allowlisted emoji picker
- [x] Clicking a chip or picker emoji toggles my reaction
- [x] Counts update for everyone via `message:update`

---

## Non-goals (later)

- Threads · group DMs · custom emoji packs · announcement channels · virus scan · docs/boards

---

[← Vision](./VISION.md) · [E2E flows →](./E2E-FLOWS.md)
