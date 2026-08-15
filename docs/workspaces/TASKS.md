# Tasks — Workspaces & members

Implement **one task at a time**. Flow discussion before each new slice (same as auth).  
Check off when reviewed.

**PO locks:** Jul 29–31 — invite→accept · existing users · chips · leave/remove/rename/delete · role after join · audit (no UI).

---

## Slice 0 — Align

- [x] Read [VISION.md](./VISION.md) + [USER-STORIES.md](./USER-STORIES.md)
- [x] Lock PO defaults: existing users only; cross-tenant → **404**; owner/admin invite; chips / no typeahead
- [ ] Push folder-structure + workspaces docs if not on remote
- [x] UI mockups approved → [FRONTEND.md](./FRONTEND.md)

---

## Slice 1 — Data foundation ✅

- [x] **T1** `lib/models/workspace/workspace.ts`
- [x] **T2** `lib/models/workspace/membership.ts` + unique index
- [x] **T3** `slugify` / unique slug helper
- [x] **T4** `createWorkspaceForUser` helper (workspace + owner membership)

---

## Slice 2 — Create + list API ✅

- [x] **T5** `POST /api/workspaces`
- [x] **T6** `GET /api/workspaces`
- [x] Manual test via UI

---

## Slice 3 — Create + list UI ✅

- [x] **T7** Wire create dialog → POST + toast + refresh (RTK)
- [x] **T8** Load list on `/workspace` (empty vs list states)
- [x] Navigate to `/workspace/[id]` from list rows

---

## Slice 4 — Get one + isolation ✅

- [x] **T9** `GET /api/workspaces/[workspaceId]` + membership check
- [x] **T10** Screen D detail UI + 404 UX
- [x] Prove random id → 404

---

## Slice 5 — Members list UI ✅

- [x] **T11** Zod `{ emails: string[] }`
- [x] **T12/T13** members GET + invite POST (not instant-add)
- [x] **T14** Screen E + chip dialog + hide CTAs for `member`

---

## Slice 5b — Invite → accept ✅

- [x] **T21** `GET/POST /api/invites/[token]` (+ accept)
- [x] **T22** `/invite/[token]` page + wrong-user / expired UX (RTK)
- [x] **T23** Dialog CTA **Send invite**; gate on `emailVerified`; toast `invited`/`failed`
- [x] Demo: A invites B → B accepts → membership; unverified B becomes verified

---

## Slice 3.5 — Membership lifecycle ✅

- [x] **T30** `DELETE .../members/me` — leave self; block sole owner
- [x] **T31** Leave UI (Screen D) + RTK + redirect to `/workspace`
- [x] **T32** `DELETE .../members/[userId]` — owner/admin remove
- [x] **T33** Remove-member UI on Screen E + confirm
- [x] **T34** `PATCH /api/workspaces/[workspaceId]` — rename (owner \| admin)
- [x] **T35** Rename UI (dialog on Screen D)
- [x] **T36** `DELETE /api/workspaces/[workspaceId]` — owner only; cascade memberships + invites
- [x] **T37** Delete UI + confirm (`ConfirmDialog`); no member notify
- [x] Manual smoke: leave / remove / rename / delete + cross-tenant 404 (E2E verified Jul 31)

---

## Slice 3.6 — Change role after join ✅

- [x] **T40** `PATCH .../members/[userId]` — body `{ role: "member" | "admin" }`; owner only
- [x] **T41** Screen E role select + RTK (immediate promote; confirm demote)

---

## Slice 6 — Docs & harden ✅ (docs pass Jul 31)

- [x] **T15** Mark API/FRONTEND/LIB docs as fully implemented
- [x] **T16** Update [progress.md](../tracking/progress.md)
- [x] **T17** verified email required to **send invites**

---

## Slice 7 — Workspace audit ✅

- [x] **T50** Model `WorkspaceEvent` + `logWorkspaceEvent` helper
- [x] **T51** Wire events on create / rename / delete / invite / accept / leave / remove / role_change
- [x] **T52** Docs: SECURITY + LIB list events (no UI viewer in v1)

---

## Later (not v1)

- [ ] Invite non-Sameward emails (signup + join)
- [ ] Notify members on workspace delete
- [ ] Transfer ownership
- [ ] Workspace audit UI / export

---

## Definition of done (module)

- [x] US-1 … US-8 acceptance criteria met in code
- [x] No cross-tenant leak in manual E2E test (Jul 31)
- [ ] Typecheck clean
- [x] Docs in `docs/workspaces/` match shipped behavior (Jul 31 pass)

---

[← Lib & models](./LIB-AND-MODELS.md) · [Security →](./SECURITY.md)
