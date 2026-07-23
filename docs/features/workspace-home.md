# Feature: Workspace home (`/workspace`)

**Phase:** 1 (shell) → extends in Phase 3 (MongoDB create)  
**Route:** `/workspace`  
**Owner decision:** This is the **default logged-in landing** after marketing (auth comes Phase 2).

---

## Business goal

A user opens TeamHub to **do work inside a workspace**.  
If they have **no workspace yet**, the product must not show a fake dashboard — it must push one clear action: **create the first workspace**.

> Mission fit: “Everything has its place.” First place = a workspace.

---

## What this page shows (PO decision)

### State A — No workspaces (Phase 1 focus)

| Element | Purpose |
|---------|---------|
| Headline | “Create your first workspace” |
| Supporting copy | Invite teammates, organize projects, use AI later |
| Primary action | **Create Workspace** |
| Secondary action | **Import Existing Data** (stub for now — logs “coming soon”) |
| Optional tip | “A workspace is your team’s shared home (channels, docs, boards).” |

No charts, no fake activity feed, no “trusted by” logos here.

### State B — Has workspaces (Phase 3+)

List/switch workspaces, open last active. **Not built yet.**

---

## Data we will store later (PO + Lead)

When Create Workspace becomes real (server + MongoDB):

| Field | Required | Why this field |
|-------|----------|----------------|
| `name` | yes | Human label (“Acme Product”) — what users recognize |
| `slug` | yes (derived) | URL-safe id (`acme-product`) — stable links later |
| `ownerId` | yes | Who created it — billing/permissions root |
| `createdAt` | yes | Audit / sorting |
| `updatedAt` | yes | Freshness |

**Not in v1 create form:** logo, colors, company size, industry — avoid onboarding bloat. Add later if business needs it.

**Why not more fields?**  
Empty-state conversion dies when the first form asks 12 questions. Senior move: **minimum data to create a tenant.**

---

## Architecture (now vs later)

```text
NOW (Phase 1):
  /workspace page (Client island for clicks)
    → Create Workspace button
    → local handler: open placeholder intent (console / alert / setState “dialog soon”)
    → NO MongoDB yet

LATER (Phase 3):
  Button → (dialog form: name)
    → RTK Query mutation (Phase 4) or fetch
    → POST /api/workspaces
    → validate schema
    → MongoDB insert { name, slug, ownerId, timestamps }
    → response → redirect /workspace/[id] or refresh list
```

Server owns creation. Browser never “trusts itself” to invent a workspace in the database.

---

## Folder placement (when schemas arrive — Phase 3)

```text
lib/
  validations/
    workspace.ts    ← Zod schema (shared client form + API)
  db/
    mongodb.ts
models/             ← or lib/models — Mongoose/collection shapes
  workspace.ts
app/api/workspaces/route.ts
```

Reusable rule: **one Zod schema** imported by API + form so client and server agree.

*(You don’t create schemas in this task — only know where they’ll live.)*

---

## Your implementation task (function only)

See chat for the single micro-task. UI polish is mentor’s follow-up.
