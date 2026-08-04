# Vision — Channels & realtime chat

## One-line vision

A workspace is a team home; a **channel** is where that team **talks in real time** — openly or privately — with enough file sharing to be useful at work.

## Mission

After auth + workspaces, customers still need **“Where do we discuss work?”**  
Channels + live messaging turn belonging into collaboration.

---

## Why this module (customer problem)

Without chat:
- Workspace home is a shell (placeholders for channels/docs/boards).
- Teams bounce to Slack/Discord and TeamHub never becomes daily.

With channels:
- Public spaces for whole-team talk (`#general`).
- Private spaces for sensitive subsets.
- Live delivery (no refresh) matching modern SaaS expectations.
- Limited files so people can share a screenshot or PDF without building Drive.

**Emotion after v1:** *“My team is talking here live,”* not *“I only have a member list.”*

---

## PO locks (Jul 31, 2026)

| # | Decision |
|---|----------|
| 1 | **Separate Socket.IO service** for realtime (Next stays REST + UI) |
| 2 | **Public + private** channels day one |
| 3 | **Hybrid `#general`** — auto-create on workspace create + tip to create more |
| 4 | Messages = **text + files** with hard limits |
| 5 | **Typing** + **basic presence** in v1 |
| 6 | **Create channel** = owner \| admin only |

---

## What “done” means (v1 scope)

**In scope**
- Channel CRUD-ish: create, list, open; rename/delete per task rules
- Public: every workspace member can see & post
- Private: only channel members (invite workspace members into private channel)
- Default `#general` (public, `isDefault`)
- Message history via REST (cursor pagination)
- Send message: REST persist → Socket.IO `message:new` to room
- Attachments: see limits below
- Typing indicators (throttled)
- Basic presence (online/offline for workspace members visible in chat chrome)
- Socket auth on handshake; authorize room join
- shadcn-based chat UI (Message / Bubble / composer patterns)

**File limits (v1 — hard)**

| Rule | Limit |
|------|--------|
| Max file size | **10 MB** per file |
| Max files per message | **3** |
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `application/pdf` |
| Blocked | executables, archives, `image/svg+xml` (XSS risk), video/audio, Office binaries |
| Image UX | Client may compress large images before upload (optional helper); PDFs uploaded as-is |
| Storage | **AWS S3** (private bucket + presigned URLs) — setup [S3-SETUP.md](./S3-SETUP.md) |
| Virus scan | **Out** of v1 |

**Out of scope (later)**
- Threads  
- DMs / group DMs  
- Reaction counts / custom emoji  
- Announcement channels  
- Unlimited / arbitrary uploads  
- Docs & boards  
- Managed realtime vendors (Ably/Pusher) as primary — we own Socket.IO service  

---

## How this connects to builders

REST encodes *what was said and who may see it*.  
Sockets encode *who hears it right now*.  
Private channels encode *belonging inside belonging* (workspace → channel).

---

[← Module index](./README.md) · [User stories →](./USER-STORIES.md)
