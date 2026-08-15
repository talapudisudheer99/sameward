# Vision — Workspaces & members

## One-line vision

Sameward is a place where **teams** work together. A **workspace** is that team’s home; **members** are who belongs there and what they’re allowed to do.

## Mission

Turn a signed-in user into someone who **belongs somewhere**: create or join a workspace, see teammates, and carry clear roles — so every later feature (channels, docs, boards, AI) has a trusted multi-tenant home.

---

## Why this module (customer problem)

Auth only answers **“Who are you?”**  
Customers still need **“Where do I work, and with whom?”**

Without workspaces:
- Login lands in an empty shell with no team meaning.
- Future features have nowhere safe to attach data.
- Two companies’ work could collide in one global bucket.

With workspaces:
- Each team gets a **boundary** (tenant).
- People **belong** via membership.
- Roles make permissions understandable before we build complex RBAC UI.

This is the **SaaS core loop**: create team space → invite people → collaborate inside it.

---

## What we provide to the customer

| Persona | What they get |
|---------|----------------|
| **New user** | Clear first action: create your team’s workspace. |
| **Owner** | “This is our Sameward” — create space, own it, invite others. |
| **Member** | Belonging: “I’m in Acme Product,” not a lone account. |
| **All** | Safety: you only see workspaces you’re a member of. |

**Emotion after Phase 3:** *“I have a team home,”* not *“I only have a login.”*

---

## What “done” means for the product (Phase 3 v1 — shipped Jul 31, 2026)

**In scope (shipped)**
- Create workspace (name → slug + owner membership)
- List *my* workspaces · open / view if member
- Roles: `owner` | `admin` | `member`
- **Invite existing Sameward users** (email link → accept → membership)
- Inviter must be email-verified; accept may verify invitee
- Cross-tenant / non-member → **404**
- **Leave** — any member; sole owner blocked (must delete; transfer = later)
- **Remove member** — owner \| admin (cannot remove owner; not self)
- **Rename** — owner \| admin
- **Delete workspace** — owner only; cascade memberships + pending invites; **no** member notify
- **Role after join** — invite = `member`; owner changes `member` ↔ `admin`
- **Workspace audit** — `WorkspaceEvent` on success mutations (no UI viewer)

**Out of scope (later — do not document as built)**
- Email / in-app notify on workspace delete
- Role picker on invite
- Transfer ownership UI
- Invite people without a Sameward account (signup + join)
- Instant-add without consent (explicitly rejected)
- Global user autocomplete / typeahead
- Audit UI / export
- Billing / plans per workspace
- Complex permission matrices
- Guest links, SSO, SCIM, allowed email domains
- Docs / boards (later)  
- Channels & live chat → [`docs/channels/`](../channels/README.md) (next module)

---

## How this connects to builders

When you implement models and APIs, you are encoding:

> *This work is shared with these people, under these rules.*

That is the product goal — CRUD is the tool, not the mission.

---

[← Module index](./README.md) · [User stories →](./USER-STORIES.md)


The Entire Mental Model

Think of Sameward like a real office building:

Sameward (The Building)
│
├── Workspace: Acme Product (Office)
│      │
│      ├── Owner: Sudheer
│      ├── Admin: Rahul
│      ├── Member: Priya
│      │
│      ├── Channels
│      ├── Documents
│      ├── Boards
│      └── AI Assistant
│
├── Workspace: Client X
│      │
│      ├── Owner: Alice
│      ├── Members
│      └── Their own data
│
└── Workspace: Marketing Team
       │
       ├── Members
       └── Their own data

Notice something very important:

Authentication gets someone into the building.
Workspaces decide which office they belong to.
Membership decides who else is in that office.
Roles decide what each person can do inside that office.