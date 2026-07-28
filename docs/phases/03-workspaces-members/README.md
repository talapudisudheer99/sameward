# Phase 3 — Workspaces & Members

**Status:** ⬜ Not started  
**Prev:** [← Phase 2](../02-authentication/README.md) · **Next:** [Phase 4 — State & data →](../04-state-data-layer/README.md)

---

## 1. Business requirement

TeamHub is **multi-tenant**: users belong to workspaces. Creating a workspace and inviting members is the core SaaS loop.

## 2. What you will build

- Create / list / get workspace APIs + UI
- Membership model with roles
- Invite member flow (basic)

## 3. Architecture

```
UI form
  → (later RTK Query) POST /api/workspaces
  → Route Handler validates + checks session
  → MongoDB: workspaces + memberships
  → JSON response → UI list update
```

## 4. Why MongoDB here

| Advantage | Disadvantage |
|-----------|--------------|
| Flexible documents for evolving schemas | Easy to create inconsistent data without discipline |
| Natural nesting / refs for memberships | Joins are manual (`$lookup` or app-level) |
| Common in Node interview stories | Postgres is equally valid — we chose Mongo for this path |

## 5. Concepts covered

- [ ] REST CRUD
- [ ] Status codes
- [ ] Validation
- [ ] MongoDB collections, ObjectIds, indexes
- [ ] Relationships via references
- [ ] Pagination / filtering basics
- [ ] Error handling shapes

## 6. Folder structure (target)

**Canonical rules:** [docs/architecture/folder-structure.md](../../architecture/folder-structure.md)

Phase 3 placement:

```
app/api/workspaces/route.ts
app/api/workspaces/[workspaceId]/route.ts
app/api/workspaces/[workspaceId]/members/route.ts
lib/models/workspace.ts
lib/models/membership.ts
lib/schemas/workspace/
components/workspace/          # as UI grows
components/dialogs/workspace/
```

Do not invent a separate Express `backend/` folder — stay in this Next modular layout.

## 7. Backend (Next + MongoDB)

### Collections (initial)

| Collection | Purpose |
|------------|---------|
| `users` | Identity |
| `workspaces` | Tenant |
| `memberships` | userId + workspaceId + role |

### Example endpoints

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/workspaces` | List mine |
| POST | `/api/workspaces` | Create |
| GET | `/api/workspaces/:id` | Detail |
| POST | `/api/workspaces/:id/members` | Invite / add |

## 8. Micro-tasks

Mentor assigns after auth is solid.

## 9. Testing & production notes

- Index `{ userId, workspaceId }` on memberships uniquely
- Never trust `workspaceId` from client without membership check

## 10. Interview questions (preview)

1. How do you model many-to-many users↔workspaces in MongoDB?
2. Why check auth in the Route Handler if middleware exists?
3. Design pagination for a large workspace list.

## 11. Definition of done

Authenticated user can create a workspace and see membership; APIs reject cross-tenant access.

---

[Docs hub](../../README.md)
