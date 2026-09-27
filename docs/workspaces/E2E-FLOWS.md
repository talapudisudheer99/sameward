# End-to-end flows — Workspaces & members

**Status:** Phase 3 **v1 shipped** (create → invite → lifecycle → roles → audit).  
Working style: discuss → docs → implement → review.

**PO locks**
- Cross-tenant / non-member → **404**
- Owner/admin invites; hide CTAs for `member`; chips; no typeahead
- Existing Sameward users only; CTA = **Send invite**; inviter **emailVerified**
- Leave / remove / rename / owner-delete (no notify)
- Owner changes member ↔ admin after join
- Accept may set `emailVerified` when invitee was unverified

---

## A) Create workspace ✅

---

## B) List my workspaces ✅

---

## C) Get one workspace ✅

---

## D) Invite members — consent flow ✅

```text
1. Owner/admin (emailVerified) opens dialog → chips → "Send invite"
2. POST /api/workspaces/:workspaceId/members  { emails: string[] }
3. Server:
     a) getCurrentUser() — 401 if missing
     b) if !user.emailVerified → 403 "Verify your email to invite teammates"
     c) Membership for caller — none → 404
     d) role owner|admin — else 403
     e) Zod emails[]
     f) For each email:
          - no User → failed not_found
          - already Membership → failed already_member
          - pending invite exists → rotate token / refresh expiry + resend
          - else create WorkspaceInvite { tokenHash, workspaceId, email,
              invitedBy, expiresAt }  // raw token only in email
          - Resend: "{Inviter} invited you to {Workspace} on Sameward"
            link: {APP_URL}/invite/{rawToken}
          - pushed → invited[]
     g) Return { invited, failed }  // NOT membership yet
4. Client: toast invited / failed; pending list optional
```

### D-accept) Accept invite

```text
1. User opens /invite/[token]
2. Must be logged in
3. GET/POST accept:
     a) hash token → find invite
     b) missing / expired / accepted → error UI
     c) session.email !== invite.email → "Sign in as {invite.email}"
     d) Membership.create({ role: member }) if not already
     e) invite.acceptedAt = now (single-use)
     f) if !user.emailVerified → emailVerified = true
     g) redirect → /workspace/{workspaceId}
```

**Why verify on accept?** Same pattern as password-reset / verify-email: possession of the link proves inbox control for that address.

**Why not instant Membership.create?** Belonging without consent is indefensible in a real product. Speed of building is not a product reason.

---

## E) Unauthorized / cross-tenant ✅

Get-one, members, invite, leave, remove, rename, delete — non-member → **404**.

---

## F) Soft email verify → hard gate on invites ✅

- App shell: banner if unverified
- **Invite APIs + Send invite CTA:** require `emailVerified`
- Create workspace: still allowed while unverified

Client: shared **`useCurrentUser`** (`GET /api/auth/me`).

---

## G) Leave / remove / rename / delete ✅

```text
Leave:   DELETE /api/workspaces/:id/members/me
         → sole owner 400; else membership gone; audit member.left
Remove:  DELETE /api/workspaces/:id/members/:userId
         → owner|admin; not self; not owner target; audit member.removed
Rename:  PATCH /api/workspaces/:id  { name }
         → owner|admin; slugifyUnique(name, id); audit workspace.renamed
Delete:  DELETE /api/workspaces/:id
         → owner only; delete invites → memberships → workspace;
           no email notify; audit workspace.deleted
```

---

## H) Change role after join ✅

```text
PATCH /api/workspaces/:id/members/:userId  { role: "member" | "admin" }
→ caller must be owner; target not owner; audit member.role_changed
UI: Screen E select — promote immediate; demote confirms
```

---

## Happy-path demo script

1. User A verified → create workspace → Send invite to User B  
2. B accepts → joins as **member** · unverified B becomes verified  
3. A promotes B to **admin** · demotes back if needed  
4. B leaves (or A removes B) · A renames · A deletes (no notify)  
5. Random workspace id → **404**  
6. Instant add does not exist  

---

[← User stories](./USER-STORIES.md) · [Data model →](./DATA-MODEL.md)
