# End-to-end flows — Channels & realtime chat

**Status:** ✅ **Implemented · E2E verified 2026-08-09** (text, files, sockets, typing, presence)  
**Working style:** discuss → docs → implement → review (same as auth/workspaces)

**PO locks:** separate Socket.IO · public+private · `#general` · text+limited files · typing + presence · create = owner/admin

---

## A) Workspace create → `#general` ✅ (spec)

```text
1. POST /api/workspaces { name }
2. createWorkspaceForUser → Workspace + owner Membership
3. ALSO create Channel { name: "general", slug, visibility: public, isDefault: true }
4. UI: workspace home → Channels entry → open #general
```

Lazy path: first channels list empty → server ensures `#general` once.

---

## B) Create public channel

```text
1. Owner/admin → Create channel → name + visibility=public
2. POST /api/workspaces/:workspaceId/channels
3. Membership check → role owner|admin → Zod → create Channel
4. All workspace members see it in list
```

---

## C) Create private channel + invite

```text
1. Owner/admin → Create → visibility=private
2. Channel created + ChannelMembership for creator
3. Invite dialog: pick workspace members (not global search)
4. POST .../channels/:channelId/members { userIds[] }
5. Target must have workspace Membership
6. Invitee now lists/opens private channel; others still 404
```

---

## D) Send text message (REST + socket)

```text
1. Client in channel UI → connected socket → joined channel:{id}
2. User sends text
3. POST .../channels/:channelId/messages { body, clientMessageId? }
4. Server: auth → workspace member → (if private) channel member
5. Message.create → 201
6. realtime service (or Next notifies it) emits message:new to room
7. Peers append; sender confirms (dedupe by id / clientMessageId)
```

**Preferred v1 wiring:** Next Route Handler writes Mongo, then **publishes** to the Socket.IO process (HTTP internal emit or shared Redis pub/sub). Avoid “socket-only write” so RTK/history stay simple.

---

## E) Attach files ✅ (presigned S3 — as built)

```text
1. User picks ≤3 files, each ≤10MB, allowlisted MIME (client pre-check)
2. On Send (lazy): POST .../channels/:channelId/uploads → batch presign
   → server validates + returns [{ key, uploadUrl, url, name, mime, sizeBytes }]
3. Client PUTs each file straight to S3 in parallel (Promise.all)
4. After all PUTs succeed: POST message { body?, attachments:[{ url, name, mime, sizeBytes }] }
   → server guards url with isManagedObjectUrl (bucket-only), persists canonical URL
5. Same emit as D. Read side signs each url with presigned GET (1h) for view/download
```

**Bucket stays private** — canonical `s3://…` URL is stored; clients only ever get short-lived presigned GET URLs. Orphan window (PUT ok, message POST fails) accepted for v1.

---

## F) Typing

```text
1. User types → throttle emit typing:start { channelId }
2. Peers show indicator
3. Idle 2–3s or send message → typing:stop
```

No DB write.

---

## G) Presence

```text
1. On socket connect + workspace context → join workspace:{id}
2. Server tracks socket userIds → emit presence:update
3. Disconnect → remove / grace period → peers update
```

---

## H) Security demo

```text
1. User not in workspace → channel APIs 404; socket join denied
2. User in workspace but not private channel → 404; join denied
3. Member tries create channel → 403
```

---

## Manual E2E test script (run before each release)

Two browsers: **A** (owner) + **B** (member), preferably one normal + one incognito.

**Setup**
- [ ] A creates workspace → `#general` auto-exists (default, public)
- [ ] A invites B to workspace → B sees `#general`

**Realtime text (flow D)**
- [ ] Both open `#general`; A sends text → B sees it appear **without refresh**
- [ ] B replies → A sees it live; no duplicates for the sender (dedupe by `clientMessageId`)
- [ ] Kill/restore network on B (DevTools offline) → "Reconnecting…" shows, then gap-fetch fills missed messages

**Private + authz (flows C, H)**
- [ ] A creates private `#hiring` → B does **not** see it (list omits; direct URL → 404)
- [ ] A invites B → B now sees/opens `#hiring`, live chat works
- [ ] A non-owner/admin member cannot see Create-channel CTA (and API returns 403)

**Files (flow E)**
- [ ] A attaches 1 image + 1 pdf (≤10MB, allowlisted) → uploads then message posts; B sees image grid + file card live
- [ ] Click image → lightbox opens (prev/next, counter, open-in-tab); Download button saves a real file
- [ ] Try a 4th file or an oversized/blocked-MIME file → rejected with clear error (client + server)
- [ ] Send attachment-only message (no text) → succeeds

**Typing + presence (flows F, G)**
- [ ] A types → B sees "A is typing…"; stops after idle/send
- [ ] B online → A's presence shows B online; B closes tab → goes offline after grace

**Pass criteria:** all boxes checked, no console errors, S3 bucket remains private (only presigned URLs reach the client).

---

[← User stories](./USER-STORIES.md) · [Data model →](./DATA-MODEL.md)
