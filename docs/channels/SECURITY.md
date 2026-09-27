# Security — Channels & realtime

Non-negotiable for this module. Builds on [workspaces SECURITY](../workspaces/SECURITY.md).

---

## Rules

1. **Session required** on every channel/message API.
2. **Workspace membership** required for any channel in that workspace.
3. **Private channel** → also **channel membership** (list/get/post/join socket).
4. **No existence leak:** unauthorized → **404** (including private channel ids).
5. **Create / manage channel / private invites** → `owner` \| `admin` only.
6. **UI is not authz.**
7. **Socket handshake authenticated**; **every room join re-authorized**.
8. **Messages:** validate body length; attachments MIME + size + count on server (never trust client alone).
9. **Uploads:** allowlist only; no SVG; no executables; store outside Mongo.
10. **Realtime internal emit** protected by shared secret (Next → realtime).
11. **Do not** broadcast to “all sockets”; use rooms only.

---

## Threats

| Threat | Mitigation |
|--------|------------|
| IDOR channel/message ids | Membership checks → 404 |
| Member creates channels | Role check |
| Peek private via socket join | Authz on `channel:join` |
| Cross-tenant presence | Presence scoped to `workspace:{id}` after membership check |
| Upload malware / huge files | MIME + 10MB + count; later AV |
| Spoofed `message:new` from client | Clients don’t authoritatively invent; server emits after write |
| XSS via SVG/HTML file | Block SVG; sanitize rendered links; careful PDF iframe policy |

---

## In one line

> “Realtime doesn’t relax authorization — it multiplies the places we must check membership: REST and every socket join.”

---

[← Tasks](./TASKS.md) · [Module index](./README.md)
