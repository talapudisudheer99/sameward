# Frontend — Workspaces & members

**UI source of truth (mockups):**
- [workspaces-mockups-flow.png](../design/references/workspaces-mockups-flow.png)  
- [workspaces-mockups-desktop-mobile.png](../design/references/workspaces-mockups-desktop-mobile.png)  

**PO status:** Mockups approved (Jul 29). Members + invite + lifecycle UX locked (Jul 30–31).

---

## Screens (shipped)

| Code | Screen | Route | Status |
|------|--------|-------|--------|
| **A** | Empty workspaces | `/workspace` when list = 0 | ✅ |
| **B** | Workspace list | `/workspace` when memberships exist | ✅ |
| **C** | Create workspace dialog | Modal over A/B | ✅ |
| **D** | Workspace home | `/workspace/[workspaceId]` | ✅ |
| **E** | Members | `/workspace/[workspaceId]/members` | ✅ |
| **Invite** | Accept invite | `/invite/[token]` `(invite)` group | ✅ |

### A — Empty ✅
Centered empty state · Create Workspace · Import stub

### B — List ✅
Rows: initials, name (truncated), role badge → D

### C — Create ✅
Name field · RTK `useCreateWorkspaceMutation` · toast

### D — Workspace home ✅
- Breadcrumb + title (`OverflowText`) + role badge  
- **Rename** pencil — owner \| admin  
- **Manage** / **Send invite** — owner \| admin (+ verified for invite)  
- Members teaser → E  
- Placeholder for channels/docs/boards  
- Danger zone: **Leave** (all) · **Delete** (owner only) + `ConfirmDialog`  
- 404 state → Back to Workspaces  

### E — Members ✅
- Table: avatar, name, email, role  
- **Send invite** — owner/admin + verified  
- **Role `<select>`** — owner only (`member` ↔ `admin`); promote immediate; demote confirms  
- **Remove** — owner/admin (not self, not owner) + confirm  
- Owner row: badge only (no role select)

### Send invite dialog ✅
Chips · no typeahead · CTA **Send invite** · toast `invited` / `failed` · gated on `emailVerified`

### Accept invite page ✅
States: loading · needs login · wrong user · expired/accepted · ready → Accept → `/workspace/{id}`  
Login `?next=/invite/[token]`

---

## Long text

Use `OverflowText` (`components/sharable/overflow-text.tsx`) + `lib/ui/overflow-text.ts`  
Variants: `ellipsis` \| `title` \| `wrap`. Flex parents need `min-w-0`.

---

## Shared dialogs

| Piece | Path |
|-------|------|
| Confirm (leave / delete / remove / demote) | `components/dialogs/confirm-dialog.tsx` |
| Create | `components/dialogs/workspace/create-work-space-dialog.tsx` |
| Invite | `components/dialogs/workspace/invite-member-dialog.tsx` |
| Rename | `components/dialogs/workspace/rename-workspace-dialog.tsx` |

---

## Shipped UI paths

| Piece | Path |
|-------|------|
| List / empty | `app/(app)/workspace/page.tsx` |
| Detail (D) | `app/(app)/workspace/[workspaceId]/page.tsx` |
| Members (E) | `app/(app)/workspace/[workspaceId]/members/page.tsx` |
| Accept invite | `app/(invite)/invite/[token]/page.tsx` |
| List rows | `components/workspace/workspace-list.tsx` |
| Members table | `components/workspace/members-table.tsx` |
| Display helpers | `components/workspace/workspace-display.ts` |
| Accept card | `components/invite/accept-invite-card.tsx` |
| RTK | `store/api/workspaces-api.ts` |
| `useCurrentUser` | `hooks/use-current-user.ts` |

---

## Client data (RTK)

All workspace/member/invite calls go through `store/api/workspaces-api.ts`:

`useGetWorkspacesQuery` · `useCreateWorkspaceMutation` · `useGetWorkspaceByIdQuery` · `useUpdateWorkspaceMutation` · `useDeleteWorkspaceMutation` · `useGetWorkspaceMembersQuery` · `useInviteWorkspaceMembersMutation` · `useRemoveWorkspaceMemberMutation` · `useUpdateWorkspaceMemberRoleMutation` · `useLeaveWorkspaceMutation` · `useGetInviteByTokenQuery` · `useAcceptInviteMutation`

Auth `me` stays on `auth-api` / `useCurrentUser`.

---

## Not in v1 UI

- Role on invite · transfer ownership · delete notify · audit viewer · non-user invites · typeahead  

---

[← API routes](./API-ROUTES.md) · [Lib & models →](./LIB-AND-MODELS.md)
