# Product Vision — TeamHub AI

## One-sentence pitch

TeamHub AI is a workspace where teams **talk, plan, document, and get AI help** in one place — built so we can master production frontend architecture end-to-end.

## Not a clone

We borrow *problems* from Slack / Notion / Jira / Trello / LinkedIn, not their UI pixel-for-pixel.

| Inspiration | Problem we steal | Our feature angle |
|-------------|------------------|-------------------|
| Slack | Team conversation & presence | Channels + realtime chat |
| Notion | Shared knowledge | Workspace docs / pages |
| Jira / Trello | Work tracking | Boards & cards |
| LinkedIn | Professional identity (light) | **Profile v1** (after Phase 8) — title, bio, avatar, teammate card |

## Core user journeys

1. **Visitor** lands → understands value → signs up
2. **Member** joins/creates a **workspace**
3. **Member** collaborates in **channels**, **docs**, **boards**
4. **Member** gets **live** updates (messages, presence, notifications)
5. **Member** uses **AI** for summaries / drafts (where it earns its place)
6. **Member** views/edits a **thin professional profile** (planned)
7. **Admin** manages members & roles

## Domain model (high level)

```
User (+ profile fields later)
  └── Membership (role) ──→ Workspace
                               ├── Channel ──→ Message
                               ├── Document
                               └── Board ──→ Card
```

Persisted in **MongoDB**. Exposed via **Next.js Route Handlers**. Consumed by **React + RTK Query**.

## Success criteria for this learning project

By the end you should be able to:

- Design a feature’s **data flow** before writing UI
- Explain **Server vs Client Components** and when Redux vs RTK Query applies
- Build secure **auth + protected APIs**
- Model multi-tenant data in **MongoDB**
- Add **realtime** without breaking REST architecture
- Test critical paths and deploy via **GitHub → Railway** (Option B)
- Defend every stack choice in an interview

## Out of scope (for now)

- Perfect pixel design systems competing with Figma-level polish
- Native mobile apps
- Full production billing / legal / SOC2
- Cloning Slack/Notion/LinkedIn feature parity
- Profile v1 stretch: posts, endorsements, public profiles outside workspace

Those can be stretch goals after Phase 8 (+ Profile v1).

---

[← Docs hub](../README.md) · [Next: Tech stack →](./stack.md)
