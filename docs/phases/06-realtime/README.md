# Phase 6 — Realtime (Socket.IO)

**Status:** ⬜ Not started  
**Prev:** [← Phase 5](../05-collaboration-core/README.md) · **Next:** [Phase 7 — AI →](../07-ai-integrations/README.md)

---

## 1. Business requirement

Teams expect **live** chat, typing indicators, online presence, and notifications — without refreshing.

## 2. What you will build

- Channel message live delivery
- Typing indicator
- Presence (online/offline)
- Basic notification events

## 3. Architecture

```
HTTP (REST): create/load message history (MongoDB)
Socket.IO:   broadcast new message / typing / presence

Client joins room: channel:abc
Server emits: message:new
Peers update RTK cache / local list
```

## 4. HTTP vs WebSockets

| | HTTP | WebSockets |
|-|------|------------|
| Connection | Request/response | Persistent |
| Best for | CRUD, auth, files | Live fanout |
| Scaling | Stateless-friendly | Needs sticky sessions / adapter (Redis) later |

**Mistake:** Putting all CRUD only on sockets — harder to cache, debug, and authorize.

## 5. Concepts covered

- [ ] Persistent connections
- [ ] Rooms & broadcasting
- [ ] Auth on socket handshake
- [ ] Cleanup on unmount / disconnect
- [ ] Scaling considerations

## 6. Folder structure (target)

```
lib/socket/
hooks/use-socket.ts
# server wiring depends on Next + Socket.IO approach we choose together
```

## 7. Backend (Next + MongoDB)

- Persist messages via Route Handler or socket handler → MongoDB
- Emit after successful write
- Collections: `messages`, optional `notifications`

## 8. Micro-tasks

Mentor assigns after collaboration REST works.

## 9. Testing & production notes

- Disconnect handlers must leave rooms
- Don’t leak messages across workspaces

## 10. Interview questions (preview)

1. When would you choose polling vs WebSockets?
2. How do you authenticate a socket connection?
3. What breaks when you scale Socket.IO to multiple servers?

## 11. Definition of done

Two browsers in the same channel see live messages + typing; you can explain REST + socket split.

---

[Docs hub](../../README.md)
