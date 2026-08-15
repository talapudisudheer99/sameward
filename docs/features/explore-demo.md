# Explore Sameward (demo)

**Status:** Shipped (static read-only demo)  
**Route:** `/explore` (auth required — same proxy gate as `/workspace`)

## Purpose

Let a new user **understand Sameward’s value** before creating a workspace:

> Sameward helps teams understand their conversations and stay on the same page.

Not a feature checklist. Not a marketing slideshow inside the app.

## Entry

Zero-workspace empty state on [`/workspace`](../../app/(app)/workspace/page.tsx):

- Primary: **Create Workspace**
- Secondary: **Explore Sameward** → `/explore`

Optional — never required.

## What it is

- Static **Acme Studio** fixtures ([`lib/explore/demo-workspace.ts`](../../lib/explore/demo-workspace.ts))
- Channels `#general`, `#engineering`, `#design`, `#product` + one DM
- Canned Channel AI ([`lib/explore/demo-ai-responses.ts`](../../lib/explore/demo-ai-responses.ts)) — Summarize, Catch up, Ask, Draft, Notes, Explain
- Reuses [`ChannelChatShell`](../../components/channel/channel-chat-shell.tsx) with `demoMode`

## What it is not

- No Mongo seed / no writes to the user account  
- No live OpenAI calls from the demo  
- Composer and destructive actions nudge toward **Create your workspace**

## Key files

| Path | Role |
|------|------|
| `app/(app)/explore/page.tsx` | Demo container |
| `components/explore/*` | Banner + end CTA |
| `lib/explore/*` | Fixtures + canned AI + runner types |

## First visit tour

On first `/explore` visit, a **8-step spotlight tour** runs (Skip / Next). Progress is stored in `localStorage` (`sameward-explore-tutorial-v1`). Users can **Replay tour** from the demo banner.

Steps: welcome → demo label → channels → read thread → Explain → Channel AI → DMs → create workspace.

---
