# Product Vision — Sameward

## One-sentence pitch

Sameward is a workspace where teams **talk, plan, document, and get AI help** in one place — built so we can master production frontend architecture end-to-end.

## Not a clone

We borrow *problems* from Slack / Notion / Jira / Trello / LinkedIn, not their UI pixel-for-pixel.

| Inspiration | Problem we steal | Our feature angle |
|-------------|------------------|-------------------|
| Slack | Team conversation & presence | Channels + realtime chat ✅ |
| Notion | Shared knowledge | Workspace docs / pages (later) |
| Jira / Trello | Work tracking | Boards & cards (later) |
| LinkedIn | Professional identity (light) | **Profile v1** ✅ — title, bio, avatar, teammate card |

## Core user journeys

1. **Visitor** lands → understands value → signs up ✅  
2. **Member** joins/creates a **workspace** ✅  
3. **Member** collaborates in **channels** ✅ (docs / boards later)  
4. **Member** gets **live** updates (messages, presence) ✅  
5. **Member** uses **AI** for summaries / drafts ✅  
6. **Member** views/edits a **thin professional profile** ✅  
7. **Admin** manages members & roles ✅  

## Domain model (high level)

```
User (+ profile fields)
  └── Membership (role) ──→ Workspace
                               ├── Channel ──→ Message
                               ├── Document   (later)
                               └── Board ──→ Card  (later)
```

Persisted in **MongoDB**. Exposed via **Next.js Route Handlers**. Consumed by **React + RTK Query**.

## Success criteria for this learning project

By the end you should be able to:

- Design a feature’s **data flow** before writing UI  
- Explain **Server vs Client Components** and when Redux vs RTK Query applies  
- Build secure **auth + protected APIs**  
- Model multi-tenant data in **MongoDB**  
- Add **realtime** without breaking REST architecture  
- Test critical paths and deploy via **GitHub → Railway**  
- Defend every stack choice in an interview  

## Out of scope (for now)

- Perfect pixel design systems competing with Figma-level polish  
- Native mobile apps  
- Full production billing / legal / SOC2  
- Cloning Slack/Notion/LinkedIn feature parity  
- Profile stretch: posts, endorsements, public profiles outside workspace  
- Docs / boards modules (still later)  

---

[← Docs hub](../README.md) · [Next: Tech stack →](./stack.md)
