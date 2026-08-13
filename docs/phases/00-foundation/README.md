# Phase 0 — Foundation

**Status:** ✅ Done  
**Prev:** — · **Next:** [Phase 1 — Product shell →](../01-product-shell/README.md)

> Learning notes below stay useful. The foundation work is finished.

---

## 1. Business requirement

Before TeamHub can sell collaboration, the engineering foundation must be correct: routing, layouts, Server vs Client Components, styling system, and TypeScript toolchain.

Wrong mental models here create expensive bugs in auth, Redux, and data fetching later.

## 2. What you will build

- No new product feature yet
- Deep understanding of the existing Next.js + shadcn scaffold
- Ability to explain the request → layout → page → client island path

## 3. Architecture

```
Request
  → app/layout.tsx (RootLayout, fonts, ThemeProvider)
  → app/page.tsx (Server Component by default)
  → components/ui/* (interactive islands as needed)
  → HTML + hydrated JS in browser
```

Backend/MongoDB: **not yet**. Don’t connect a database before you understand the UI runtime.

## 4. Why these technologies

| Choice | Why now |
|--------|---------|
| App Router | Modern Next default; layouts + RSC are interview-critical |
| Server Components default | Smaller bundles; clear server/client boundary |
| Tailwind + shadcn | Fast UI without losing ownership of components |

## 5. Concepts covered

- [ ] App Router file conventions
- [ ] Root layout vs page
- [ ] Server vs Client Components
- [ ] `suppressHydrationWarning` / hydration basics
- [ ] Path aliases (`@/`)
- [ ] Theme provider placement
- [ ] shadcn component ownership model

## 6. Folder structure (current)

```
app/
  layout.tsx
  page.tsx
  globals.css
components/
  theme-provider.tsx
  ui/button.tsx
lib/utils.ts
docs/   ← you are here
```

## 7. Backend (Next + MongoDB)

Deferred to Phase 3. Phase 0 is frontend runtime literacy.

## 8. Micro-tasks (mentor-driven)

1. 🔄 Answer questions about `layout.tsx` / `page.tsx` (current)
2. ⬜ Trace ThemeProvider + dark mode toggle
3. ⬜ Sketch proposed `app/` folder tree for Phase 1 (on paper / markdown only)

## 9. Testing & production notes

- Know how to run `npm run dev`, `lint`, `typecheck`
- No feature tests yet

## 10. Interview questions (preview)

1. What is a Server Component? How do you make a Client Component?
2. Why put providers in the root layout?
3. What problem does hydration solve? What breaks it?
4. Why does shadcn copy components into your repo?

## 11. Definition of done

You can explain the scaffold’s data/render path without reading docs, and mentor signs off Phase 0.

---

[Docs hub](../../README.md) · [Feature index](../../features/README.md)
