# Product Vision — Sameward

## One-sentence pitch

Sameward is a workspace where teams **talk, plan, document, and get AI help** in one place, built with a production-grade frontend and realtime architecture.

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

## Engineering principles

- Design each feature’s **data flow** before building UI  
- Use **Server vs Client Components** deliberately; Redux for UI state, RTK Query for server state  
- Secure **auth + protected APIs** on every route  
- Model multi-tenant data cleanly in **MongoDB**  
- Add **realtime** without breaking the REST source of truth  
- Test critical paths end to end and deploy via **GitHub → Railway**  
- Every stack choice has a written reason  

## Out of scope (for now)

- Perfect pixel design systems competing with Figma-level polish  
- Native mobile apps  
- Full production billing / legal / SOC2  
- Cloning Slack/Notion/LinkedIn feature parity  
- Profile stretch: posts, endorsements, public profiles outside workspace  
- Docs / boards modules (still later)  

---

[← Docs hub](../README.md) · [Next: Tech stack →](./stack.md)
