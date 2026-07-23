# Phase 4 — State & Data Layer (Redux Toolkit + RTK Query)

**Status:** ⬜ Not started  
**Prev:** [← Phase 3](../03-workspaces-members/README.md) · **Next:** [Phase 5 — Collaboration →](../05-collaboration-core/README.md)

---

## 1. Business requirement

The UI must stay consistent as users navigate: cached workspace lists, loading/error states, and shared UI state (sidebar, active workspace) without spaghetti prop drilling.

## 2. What you will build

- Redux store + typed hooks
- UI slices (e.g. sidebar, active workspace id)
- RTK Query API slice wrapping `/api/**`
- Cache tags + invalidation for workspace mutations

## 3. Architecture

```
React component
  → useAppSelector / useGetWorkspacesQuery
  → RTK Query middleware
  → fetch Route Handler
  → MongoDB
  → cache update
  → re-render
```

## 4. Why Redux Toolkit + RTK Query

| Tool | Problem it solves |
|------|-------------------|
| Classic Redux | Shared state — but too much boilerplate |
| Redux Toolkit | Slices, Immer, sane defaults |
| RTK Query | Server cache, deduping, invalidation |
| Axios alone | Fine for tiny apps; weak cache story at scale |

**Trade-off:** Learning curve. Worth it for production SaaS + interviews.

## 5. Concepts covered

- [ ] configureStore
- [ ] createSlice
- [ ] selectors
- [ ] createApi / endpoints
- [ ] tags & invalidation
- [ ] mutations vs queries
- [ ] Provider placement (Client boundary!)

## 6. Folder structure (target)

```
store/
  index.ts
  hooks.ts
  slices/ui-slice.ts
  api/base-api.ts
  api/workspaces-api.ts
components/providers/redux-provider.tsx
```

## 7. Backend (Next + MongoDB)

No new DB required — this phase **consumes** Phase 3 APIs cleanly.

## 8. Micro-tasks

Mentor assigns after workspaces APIs exist.

## 9. Testing & production notes

- Test slices with pure actions
- Mock API for RTK Query hooks in RTL

## 10. Interview questions (preview)

1. Redux vs Context — when each?
2. Why RTK Query instead of useEffect + fetch?
3. What is cache invalidation?

## 11. Definition of done

Workspace list loads via RTK Query; creating a workspace updates UI through invalidation/optimistic update strategy you can explain.

---

[Docs hub](../../README.md)
