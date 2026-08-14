# Phase 1 — Product Shell

**Status:** ✅ Done  
**Prev:** [← Phase 0](../00-foundation/README.md) · **Next:** [Phase 2 — Authentication →](../02-authentication/README.md)

> Landing and app shell are built. This page stays as the learning guide.

---

## 1. Business requirement

Users need a public **landing** experience and a private **app shell** (sidebar, top bar, workspace switcher placeholder) that feels like a real SaaS product.

## 2. What you will build

- Marketing/landing route (`/`)
- Authenticated app layout placeholder (`/app/...`) — protection comes in Phase 2
- Responsive navigation composition with Tailwind + shadcn

## 3. Architecture

```
app/
  (marketing)/layout.tsx + page.tsx
  (app)/app/layout.tsx + page.tsx
```

Route groups teach **nested layouts** without changing the URL.

## 4. Why these technologies

| Choice | Advantage | Trade-off |
|--------|-----------|-----------|
| Nested layouts | Shared chrome without prop drilling | Must understand layout boundaries |
| Route groups `(marketing)` | Organize without URL noise | Easy to over-nest — keep shallow |
| Composition over mega-pages | Testable pieces | More files (good for production) |

## 5. Concepts covered

- [ ] Nested layouts
- [ ] Route groups
- [ ] Component composition
- [ ] Responsive flex/grid
- [ ] Accessible nav patterns
- [ ] Metadata API (basic)

## 6. Target folder structure

```
app/
  (marketing)/
    layout.tsx
    page.tsx
  (app)/
    app/
      layout.tsx
      page.tsx
components/
  layout/
    site-header.tsx
    app-sidebar.tsx
```

## 7. Backend (Next + MongoDB)

Still none for shell chrome. Optional: health check `GET /api/health` as a tiny Route Handler warm-up (mentor may assign).

## 8. Micro-tasks

Assigned one-at-a-time after Phase 0 sign-off.

## 9. Testing & production notes

- Visual check mobile + desktop
- No broken landmark roles (`nav`, `main`)

## 10. Interview questions (preview)

1. What is a Next.js layout and how does nesting work?
2. Server Component parent with Client child — what can / can’t pass?
3. How would you structure a SaaS marketing vs app routes?

## 11. Definition of done

Landing + app shell render cleanly; you can draw the layout tree on a whiteboard.

---

[Docs hub](../../README.md)
