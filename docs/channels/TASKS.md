# Tasks — Channels & realtime chat

Implement **one task at a time**. Flow discussion before each new slice.  
Check off when reviewed.

**Module:** Phase 5 channel slice + Phase 6 chat realtime — merged.  
**PO locks:** Jul 31, 2026 — [VISION.md](./VISION.md)

---

## Slice 0 — Align

- [x] PO locks: Socket.IO separate service · public+private · `#general` · text+files limits · typing+presence · create owner/admin
- [x] Module docs folder `docs/channels/`
- [x] Chat components mockup approved (`channels-mockups-dialogs.png`) + logo system adopted
- [ ] Approve remaining UI: flow sheet + desktop/mobile hero → [FRONTEND.md](./FRONTEND.md) (optional to start Slice 1)
- [x] Lock file storage vendor: **AWS S3** — setup guide [S3-SETUP.md](./S3-SETUP.md)
  - Ready: `ap-south-1` · bucket `teamhub-ai-dev-sudheer-2026` · IAM `teamhub-ai-dev` · `.env.local` has all 4 keys (Aug 1, 2026)
- [x] Realtime path default: `server/realtime/` (confirm when scaffolding)

---

## Slice 1 — Data foundation

- [x] **T1** `Channel` model + slug unique per workspace
- [x] **T2** `ChannelMembership` model
- [x] **T3** `Message` model (+ attachments array shape)
- [x] **T4** `ensureDefaultGeneral` + wire into workspace create
- [x] **T5** Zod schemas for channel + message (reviewed Aug 1)

---

## Slice 2 — Channels REST + UI shell

- [x] **T6** `GET/POST /api/workspaces/:id/channels` (reviewed Aug 1)
- [x] **T7** `GET/PATCH/DELETE .../channels/:channelId` (reviewed Aug 1)
- [x] **T8** Private members `POST/GET/DELETE .../members` (reviewed Aug 2)
- [x] **T9** Sidebar list + create dialog + open chat route shell (**UI + RTK wired** — ready for manual test)
- [x] **T10** Hide create for `member`; 404 private isolation demo (manual test passed Aug 2)

---

## Slice 3 — Message history + send (REST first)

- [x] **T11** `GET/POST .../messages` (text only; reviewed Aug 3)
- [x] **T12** RTK endpoints + transcript UI (reviewed Aug 3)
- [x] Manual: refresh shows history

---

## Slice 4 — Socket.IO service + live messages

- [x] **T13 / Step A** Scaffold realtime process + `GET /health` (reviewed Aug 4) — [STEP-A-REALTIME-SCAFFOLD.md](./STEP-A-REALTIME-SCAFFOLD.md)
- [x] **T13 / Step B** Attach Socket.IO + smoke connect (reviewed Aug 4) — [STEP-B-SOCKET-ATTACH.md](./STEP-B-SOCKET-ATTACH.md)
- [x] **T14** Handshake auth + `channel:join` authz (`server/realtime/auth.ts`, `rooms.ts`)
- [x] **T15** `notifyRealtime` after POST message → `message:new` (`internal-http.ts`, `notify-realtime.ts`)
- [x] **T16** `SocketProvider` + live append + reconnect gap fetch
- [x] Demo: two browsers, live text

---

## Slice 5 — Typing + presence

- [x] **T17** Typing events + UI
- [x] **T18** Workspace presence + UI (`workspace-handlers.ts`, `use-workspace-presence`)

---

## Slice 6 — Files (after vendor lock)

- [ ] **T19** Upload API / provider wiring
- [ ] **T20** Enforce 10MB / 3 files / MIME allowlist server-side
- [ ] **T21** Composer attachments + Attachment UI states
- [ ] **T22** Live message with attachments

---

## Slice 7 — Docs harden

- [ ] **T23** Mark API/FRONTEND/SOCKETS/LIB as implemented (exact)
- [ ] **T24** Update [progress.md](../tracking/progress.md)
- [ ] Manual E2E script in [E2E-FLOWS.md](./E2E-FLOWS.md)

---

## Later (not this module v1)

- [ ] Threads  
- [ ] DMs  
- [ ] Reactions  
- [ ] Redis adapter multi-instance  
- [ ] Docs / boards modules  

---

## Definition of done (module v1)

- [ ] US-C1…US-C9 acceptance met (or deferred with note)
- [ ] Two clients live-chat in public + private
- [ ] File limits enforced
- [ ] Typing + basic presence visible
- [ ] Docs match shipped code exactly

---

[← Lib & models](./LIB-AND-MODELS.md) · [Security →](./SECURITY.md)
