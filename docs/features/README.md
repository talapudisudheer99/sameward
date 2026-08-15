# Feature index

Jump from a **product feature** to the right doc.  
Status means **built in the app**, not “planned.”

| Feature | Status | Doc |
|---------|--------|-----|
| Landing / app shell | ✅ | [Phase 1](../phases/01-product-shell/README.md) |
| Sign up / login / logout | ✅ | [**auth/**](../auth/README.md) |
| Google OAuth | ✅ | [auth E2E](../auth/E2E-FLOWS.md) · [API](../auth/API-ROUTES.md) |
| Sessions / cookies / proxy | ✅ | [auth Overview](../auth/OVERVIEW.md) |
| Email verification (soft) | ✅ | [auth Hardening F2](../auth/HARDENING.md) |
| Forgot / reset password | ✅ | [auth E2E](../auth/E2E-FLOWS.md) |
| Rate limits / audit / remember-me / logout-all | ✅ | [auth Hardening](../auth/HARDENING.md) |
| Device sessions (max 2) + Settings | ✅ | [**settings/**](../settings/README.md) |
| Create / list / rename / delete workspaces | ✅ | [**workspaces/**](../workspaces/README.md) |
| Invite → accept + members / leave / remove / roles | ✅ | [workspaces stories](../workspaces/USER-STORIES.md) |
| Workspace description | ✅ | Optional ≤280 chars · [workspaces](../workspaces/DATA-MODEL.md) |
| Tenant isolation + workspace audit | ✅ | [workspaces SECURITY](../workspaces/SECURITY.md) |
| Redux / RTK Query | ✅ | Used for workspaces, channels, AI, profiles, settings, uploads |
| Channels + live chat (Socket.IO) | ✅ | [**channels/**](../channels/README.md) |
| Unread + catch-up cursor | ✅ | [channels DATA-MODEL](../channels/DATA-MODEL.md) · [API](../channels/API-ROUTES.md) |
| 1:1 DMs | ✅ | [channels](../channels/README.md) · `…/dms` |
| @mentions | ✅ | [channels](../channels/USER-STORIES.md) |
| Message edit / soft delete | ✅ | [channels](../channels/README.md) |
| Message reactions | ✅ | [channels](../channels/README.md) |
| File attachments (S3) | ✅ | [S3-SETUP](../channels/S3-SETUP.md) · [channels](../channels/README.md) |
| Link preview cards (OG) + composer live preview | ✅ | [LINK-PREVIEWS](../channels/LINK-PREVIEWS.md) |
| Channel drag-and-drop files | ✅ | [channels FRONTEND](../channels/FRONTEND.md) |
| Long message “See more” | ✅ | [channels FRONTEND](../channels/FRONTEND.md) |
| AI assist (Path A) | ✅ | [**ai/**](../ai/README.md) |
| AI reads public shared links | ✅ | [LINK-CONTEXT](../ai/LINK-CONTEXT.md) |
| Member profiles (thin v1) | ✅ | [**profiles/**](../profiles/README.md) |
| Explore Sameward demo | ✅ | [explore-demo](./explore-demo.md) |
| Docs / boards | ⬜ Later | Not built |
| AI V1.5 (large Catch up / Ask sources / cache) | ⬜ Later | [ai CONVERSATION-UNDERSTANDING](../ai/CONVERSATION-UNDERSTANDING.md) |
| Tests + Railway live deploy | ⬜ Next | [Phase 8](../phases/08-quality-deployment/README.md) · [deploy](../architecture/deploy.md) |

Workspace empty-state notes: [workspace-home.md](./workspace-home.md)

---

[← Docs hub](../README.md)
