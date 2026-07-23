# Phase 5 — Collaboration Core

**Status:** ⬜ Not started  
**Prev:** [← Phase 4](../04-state-data-layer/README.md) · **Next:** [Phase 6 — Realtime →](../06-realtime/README.md)

---

## 1. Business requirement

Workspaces need real work surfaces: **channels** (discussion homes), **documents** (shared knowledge), **boards** (task tracking).

## 2. What you will build

- Channels CRUD (REST; live messages arrive in Phase 6)
- Documents list/create/edit (controlled forms)
- Boards + cards (drag optional stretch)
- Search / filter / pagination patterns on lists

## 3. Architecture

```
Feature UI
  → RTK Query endpoints
  → /api/workspaces/:id/channels|documents|boards
  → MongoDB collections
  → cache updates → UI
```

Each sub-feature teaches a different UI pattern (lists, forms, kanban state).

## 4. Why this phase after state layer

Building collaboration **before** RTK Query usually creates fetch spaghetti. We intentionally wait.

## 5. Concepts covered

- [ ] Controlled forms
- [ ] Dynamic routes
- [ ] Pagination & filtering
- [ ] Optimistic updates
- [ ] shadcn Dialog / Sheet / Table / Tabs
- [ ] Accessibility for complex widgets

## 6. Folder structure (target)

```
app/(app)/app/[workspaceId]/channels/...
app/api/workspaces/[workspaceId]/channels/route.ts
models/Channel.ts Document.ts Board.ts Card.ts
```

## 7. Backend (Next + MongoDB)

| Collection | Key fields |
|------------|------------|
| `channels` | workspaceId, name, createdBy |
| `documents` | workspaceId, title, content, updatedAt |
| `boards` | workspaceId, name |
| `cards` | boardId, title, column, order |

Always scope queries by `workspaceId` + membership.

## 8. Micro-tasks

Mentor breaks each surface into tiny tasks.

## 9. Testing & production notes

- Integration tests for create-channel happy path
- Debounce search inputs

## 10. Interview questions (preview)

1. Optimistic UI — risks and rollback?
2. How do you prevent IDOR on `/api/.../documents/:id`?
3. Controlled vs uncontrolled inputs?

## 11. Definition of done

At least one full vertical slice (e.g. channels) works end-to-end with MongoDB + RTK Query; docs/boards follow same pattern.

---

[Docs hub](../../README.md)
