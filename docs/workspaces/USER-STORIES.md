# User stories — Workspaces & members

Format: **As a… I want… So that…**  
Each story has **acceptance criteria** we can demo.

**PO locks**
- Jul 29–30: cross-tenant → **404**; owner/admin only for invites; chips UX; no global typeahead  
- Jul 30 (product): **invite → accept** (not instant-add); **existing Sameward users only**; inviter must be **emailVerified**  
- Jul 31: leave / remove / rename / owner-delete (no notify) · owner changes member ↔ admin · workspace audit (no UI)

**Status:** US-1…US-8 implemented + E2E verified (Jul 31).

---

## Epic

**As a** signed-in Sameward user,  
**I want** workspaces I can create and join with teammates,  
**So that** my work lives in a shared team home with clear boundaries.

---

## US-1 — Create first workspace

**As a** newly signed-in user with no workspaces,  
**I want** to create a workspace with a name (and optional short description),  
**So that** my team has a home in Sameward and members know what it’s for.

**Acceptance**
- [x] From `/workspace` empty state, I open Create Workspace and submit a valid name
- [x] Optional description (≤280) can be left blank
- [x] API creates `Workspace` + `Membership` with role `owner` for me
- [x] I see the new workspace in my list (or land in its view); description shows on home when set
- [x] Invalid name (too short/long) shows validation errors (Zod)
- [x] Unauthenticated request → 401

---

## US-2 — List my workspaces

**As a** member of one or more workspaces,  
**I want** to see only workspaces I belong to,  
**So that** I never see another team’s spaces.

**Acceptance**
- [x] `GET /api/workspaces` returns only workspaces linked to my memberships
- [x] Empty list drives empty-state UI (create CTA)
- [x] Non-member workspaces never appear

---

## US-3 — Open a workspace I belong to

**As a** workspace member,  
**I want** to open a workspace by id,  
**So that** I can use it as the context for future features.

**Acceptance**
- [x] `GET /api/workspaces/:id` succeeds if I am a member
- [x] Returns **404** if I am not a member (no existence leak)
- [x] Response includes my role in that workspace

---

## US-4 — Roles exist and mean something simple

**As an** owner,  
**I want** clear roles (`owner` / `admin` / `member`),  
**So that** we can later gate invites and settings without redesigning data.

**Acceptance**
- [x] Membership stores `role`
- [x] Creator is always `owner`
- [x] Only **owner/admin** can send invites (API + UI)
- [x] `member` can view workspace they belong to
- [x] `member` does **not** see **Manage** / **Send invite** CTAs (hide; API still 403)

---

## US-5 — Invite members (consent-based)

**As an** owner or admin with a **verified email**,  
**I want** to invite existing Sameward users by email,  
**So that** they join my workspace only after they accept — I never force people in.

### Why this flow

Instant-add without consent lets anyone pull a teammate into a workspace without asking. That is easy to build and hard to defend.  
**Invite → email link → accept** is how Notion/Slack-class products work: belonging is opted into, inbox ownership is proven by clicking the link, and we can mark `emailVerified` on accept when it was still false.

### Acceptance

- [x] Inviter must be `emailVerified` — else **403** with clear message (and UI hides / disables Send invite)
- [x] Dialog CTA = **Send invite** (not “Add”)
- [x] Body `{ emails: string[] }` — chips UX; existing Sameward users only
- [x] Unknown email → failed `not_found` (no account yet; signup+invite = later)
- [x] Already a member → failed `already_member`
- [x] Pending invite already open → resend / refresh token (not 10 duplicate invites)
- [x] Success creates **WorkspaceInvite** + sends Resend email (workspace name + inviter name)
- [x] Does **not** create `Membership` until accept
- [x] Accept link: logged-in user matching invite email → membership `member` + invite consumed
- [x] On accept: if `emailVerified === false` → set `true` (same inbox proved the click)
- [x] Wrong logged-in user → clear “sign in as {email}” UX
- [x] Expired / used token → clear error
- [x] Non-owner/admin → **403**; non-member of workspace → **404**
- [x] No global user typeahead

### Out of scope (later)

- Invite people who don’t have a Sameward account yet (signup + join)
- Role picker on invite
- Invite links / allowed email domains

---

## US-6 — Tenant isolation (security story)

**As a** customer,  
**I want** my workspace data unreachable by outsiders,  
**So that** I can trust Sameward with team work.

**Acceptance**
- [x] Guessing another workspace’s id does not return its details (get-one → 404)
- [x] Member / invite / leave / remove / rename / delete APIs require membership (and role / verified where needed)
- [x] Documented in [SECURITY.md](./SECURITY.md)

---

## US-7 — Leave, remove, rename, delete

**As a** workspace member (or owner/admin where noted),  
**I want** to leave, remove teammates, rename, or delete my workspace,  
**So that** belonging and the team home stay accurate over time.

**Acceptance**
- [x] Leave via `DELETE .../members/me` — sole owner blocked (**400**)
- [x] Leave UI on Screen D + redirect to `/workspace`
- [x] Owner/admin remove another member (not self, not owner) + confirm UI
- [x] Owner/admin rename via `PATCH` + dialog
- [x] Owner delete workspace (cascade invites + memberships); **no** email notify
- [x] Delete confirm UI; non-owner does not see delete

---

## US-8 — Change role after join

**As an** owner,  
**I want** to promote or demote members between `member` and `admin`,  
**So that** I can share invite/remove powers without transferring ownership.

**Acceptance**
- [x] Invite always joins as `member`
- [x] `PATCH .../members/[userId]` `{ role }` — **owner** only; cannot change owner
- [x] Screen E role select; promote immediate; demote confirms
- [x] Transfer ownership = out of scope for v1

---

## Non-goals (explicit / deferred)

- Instant membership create on “invite” click (rejected)
- Role picker on invite
- Transfer ownership wizard
- Notify members on workspace delete
- Audit UI / export (events are written; no viewer)
- Global “search all users” autocomplete
- Guest links / allowed email domains
- Invite non-Sameward emails

---

[← Vision](./VISION.md) · [E2E flows →](./E2E-FLOWS.md)
