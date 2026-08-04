# End-to-end flows — Channels & realtime chat

**Status:** Spec locked · not built  
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

## E) Attach files

```text
1. User picks ≤3 files, each ≤10MB, allowlisted MIME
2. Upload to storage (presign or UploadThing) → get URLs
3. POST message { body?, attachments: [{ url, name, mime, size }] }
4. Same emit as D
5. Reject oversize / bad type before storage when possible
```

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

## Happy-path demo script

1. A creates workspace → `#general` exists  
2. A invites B to workspace (existing flow) → both in `#general` live  
3. A creates private `#hiring` → B cannot see until invited  
4. A invites B to `#hiring` → live chat + typing  
5. A uploads PNG &lt; 10MB → B sees attachment  
6. Presence shows both online  

---

[← User stories](./USER-STORIES.md) · [Data model →](./DATA-MODEL.md)
