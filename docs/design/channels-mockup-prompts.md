# Channels UI — mockup briefs & generation prompts

**Goal:** Approve visuals before coding (same process as workspaces).  
**Save outputs to:** `docs/design/references/`

| File (suggested name) | Contents | Status |
|------------------------|----------|--------|
| `channels-mockups-flow.png` | Screen map Ch-A…F + dialogs | ⬜ |
| `channels-mockups-desktop-mobile.png` | Main chat desktop + mobile | ⬜ |
| `channels-mockups-dialogs.png` | Create channel · invite private · composer+attach | ✅ |
| `teamhub-logo-system.png` | Logo mark + variants | ✅ adopted in `TeamHubLogo` |

**When regenerating flow / desktop sheets:** use the **hexagon + people** mark (not the old cube). See `teamhub-logo-system.png`.

**Brand (must match Sameward design system)**
- Light UI only (not dark mode)
- Background `#F7F9FB`, cards white, text `#111827`, muted `#64748B`
- **One accent:** Electric Teal `#0F9D94` — primary buttons, active channel, online dots, send button
- Borders `#D9E2EC`, muted surfaces `#EEF2F6`
- Fonts: clean geometric sans (like Inter is OK for mockups; product uses brand fonts)
- **Avoid:** purple/indigo gradients, cream+terracotta, neon glow, emoji clutter, floating badge stickers on hero media, dense card grids

**Product locks to show in UI**
- Channel create = owner/admin (show Create on owner view)
- Public vs private (lock icon on private)
- `#general` default in list
- Live chat transcript + composer
- Typing line + online presence dots
- File attach (image thumb + PDF chip) — max 3 implied in UI, not a settings screen
- **No** threads panel, **no** reaction picker, **no** DM inbox

---

## Component inventory (what to draw)

### App chrome (all screens)
- Top: Sameward wordmark / logo left; workspace name; user avatar right
- Left app nav (narrow): Workspaces · **Channels** (active) · Members · placeholder Docs/Boards muted
- Or: within workspace layout — left **channel sidebar**, center **chat**, optional right **people** strip

### Ch-A — Channel sidebar
- Header: “Channels” + **+** button (teal, owner view)
- List rows: `# general` (hash) · `# eng` · lock + `# hiring` (private)
- Active row: teal left bar or teal wash background
- Footer tip (subtle): “Create channels for topics”

### Ch-B — Soft empty / tip (optional small state)
- Rare if `#general` exists — small inline tip under list, not a full empty marketing page

### Ch-C — Create channel dialog
- Title: Create channel
- Field: Name
- Segmented control or radio: **Public** / **Private** (with one-line help under each)
- Primary: Create · Secondary: Cancel
- No role picker

### Ch-D — Chat (hero screen)
- Top bar: channel name `#general` or lock + `#hiring` · member count · presence “3 online”
- Optional slim reconnect banner (show once in flow sheet as variant): “Reconnecting…” muted
- Message list:
  - Avatar · name · time · bubble text
  - One message with **image thumbnail** attachment
  - One message with **PDF** attachment chip (name + size)
  - Group consecutive messages visually if helpful
- Below list: “Priya is typing…”
- Composer:
  - Textarea placeholder “Message #general”
  - Icons: paperclip (attach) · smile (emoji) · **Send** teal button
  - Attachment preview row above input (1 image + 1 pdf chip, dismissible)

### Ch-E — Private channel members panel
- Right drawer or side panel: “Members” list with avatars + online dots
- Button: Invite people (owner)

### Ch-F — Invite to private channel dialog
- Title: Add people to #hiring
- List of **workspace members** with checkboxes (not email chips free-text)
- Primary: Add · Cancel
- Helper: “Only people already in this workspace”

---

## Prompt 1 — Flow sheet (generate first)

Copy-paste:

```text
UI mockup flow sheet for Sameward — Channels & realtime chat module. Product: B2B team collaboration SaaS. Light mode only. Background #F7F9FB, white panels, text #111827, muted #64748B, borders #D9E2EC, single accent Electric Teal #0F9D94. Clean engineered SaaS UI like Linear + Slack, generous whitespace, no purple, no neon, no dark mode, no decorative stickers.

Layout: one wide landscape poster with labeled wireframe-quality high-fidelity screens arranged in a clear flow with small arrows and labels Ch-A, Ch-C, Ch-D, Ch-E, Ch-F.

Include these panels:
1) Ch-A Channel sidebar inside workspace shell: list #general (public), #eng, private #hiring with lock icon, teal + Create button for owner.
2) Ch-C modal Create channel: name field, Public vs Private radio, Create/Cancel.
3) Ch-D main chat: transcript with 4–5 messages, one image attachment thumbnail, one PDF chip, typing indicator “Priya is typing…”, composer with attach + emoji + teal Send.
4) Ch-E right members panel for private channel with online green/teal dots.
5) Ch-F modal Add people to #hiring: checklist of workspace members, Add/Cancel.
6) Tiny banner variant on Ch-D: “Reconnecting…” 

Annotations in small readable sans labels only (not lorem paragraphs). Crisp UI screenshot style, not illustration, not 3D. Desktop web app frames.
```

**Save as:** `channels-mockups-flow.png`

---

## Prompt 2 — Desktop + mobile hero chat

Copy-paste:

```text
High-fidelity UI mockup, two devices side by side on a light gray studio background.

Left: Desktop browser window — Sameward workspace Channels view.
- Left sidebar: channel list with #general active (teal accent), #design, locked #hiring.
- Center: chat for #general. Header shows “# general”, “12 members”, “4 online”.
- Message thread: realistic short work chat (standup, share screenshot). One message includes a rounded image attachment preview. One includes a PDF file chip “spec.pdf · 2.1 MB”.
- Under thread: “Rahul is typing…”
- Bottom composer: multiline input, paperclip, emoji, teal Send button. Small attachment preview chips above the input (one png, one pdf).
- Subtle online presence dots on a slim right people strip (optional).

Right: Mobile phone frame — same Sameward chat, stacked: top channel title, messages, composer with attach + send. Hamburger or back to channels list.

Brand: light UI, Electric Teal #0F9D94 accent only, background #F7F9FB, white cards, border #D9E2EC, muted text #64748B. No purple, no dark mode, no threads UI, no reaction pills on messages, no DM list. Clean modern SaaS, sharp typography, production-ready mockup screenshot style.
```

**Save as:** `channels-mockups-desktop-mobile.png`

---

## Prompt 3 — Dialogs + composer detail

Copy-paste:

```text
UI component detail sheet for Sameward chat. Light mode, Electric Teal #0F9D94 accent, background #F7F9FB, white surfaces, borders #D9E2EC. Clean shadcn-like components, not Material Design.

Arrange 4 large labeled component close-ups on one landscape canvas:

A) Create channel dialog — title Create channel; text input Channel name; two options Public (“Everyone in the workspace”) and Private (“Invite only”) with lock icon; buttons Cancel and teal Create.

B) Add to private channel dialog — title Add people to #hiring; scrollable list of 5 people with avatar, name, email, checkbox; helper text “Only workspace members”; Cancel and teal Add.

C) Chat composer detailed — textarea, row of icons paperclip and smile, teal Send; above input an attachment row: image thumbnail with X, PDF chip with X; tiny caption “Max 3 files · 10 MB · images & PDF”.

D) Message bubbles row — incoming and outgoing text bubbles; one bubble with image; one with PDF attachment; below “Priya is typing…”; small “Reconnecting…” banner sample above the thread.

No purple, no dark mode, no emoji reaction bars, no thread sidebar. High-fidelity flat UI screenshot style.
```

**Save as:** `channels-mockups-dialogs.png`

---

## After you generate

1. Drop the three PNGs into `docs/design/references/` with the names above.  
2. Tell me “mockups ready” — we review against this inventory, then mark FRONTEND mockups approved and start Slice 1 (models).  
3. If anything is wrong (e.g. shows DMs/threads/dark mode), regenerate that sheet only with:  
   `Same prompt, but remove X and ensure Y.`

---

[← Frontend](../channels/FRONTEND.md) · [Design system](./design-system.md)
