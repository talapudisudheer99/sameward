# Sameward — Visual Identity & Design System v1.0

> Reference mockups: [references/teamhub-ui-mockups-v1.png](./references/teamhub-ui-mockups-v1.png)  
> Logo system: [references/teamhub-logo-system.png](./references/teamhub-logo-system.png)  
> Channels chat components: [references/channels-mockups-dialogs.png](./references/channels-mockups-dialogs.png)

## Brand summary

Sameward is a collaboration platform for teams that spend their workday in one app. Clarity over excitement. Confidence over novelty. **Engineered, not decorated.**

| Do | Don’t |
|----|--------|
| Generous whitespace | Gradient overload |
| Strong hierarchy | Neon “AI” aesthetics |
| Restrained color (one accent) | Playful blobs / sticker UI |
| Clean typography | Pills everywhere |
| Subtle motion | Decorative shadows |
| Obvious interactions | Purple / indigo / cream-terracotta clichés |

**Voice:** “Everything has its place.” — not “Look how futuristic our AI is.”

**Accent:** Ocean Blue `#0369A1` (dark: `#0EA5E9`) — one accent only.
Brand gradient endpoints: `--brand-a #0EA5E9` → `--brand-b #22D3EE` (sky → cyan), used only for brand moments (logo mark, hero, auth panel).

> **Palette v1.1 (Aug 2026):** switched from Electric Teal to Ocean Blue. All colors live as tokens in `app/globals.css`; components reference tokens only, so the swap required no component edits.

## Logo

**Mark:** Two tapered wings travelling the same way (“ward” = direction), filled with the `--brand-a → --primary` gradient (`--brand-a → --brand-b` on dark panels). The trailing wing sits at 42% opacity so the pair reads as movement, not repetition. No container tile in-app — the tile is favicon-only.  
**Wordmark:** `Sameward` in foreground ink (single product name; no “AI” suffix). Theme tokens keep the mark aligned with the active palette.  
**Component:** `TeamHubLogo` in `components/layout/teamhub-logo.tsx` (filename/export kept for now; visible wordmark is Sameward).

| Variant | Use |
|---------|-----|
| `mark` | Favicon-style, collapsed chrome |
| `horizontal` | Headers, sidebar, marketing (default for nav) |
| `stacked` | Centered / tight vertical spaces |
| `tone="onDark"` | Navy marketing panels (white Sameward wordmark) |

Clear space ≈ mark height on all sides. Do not stretch or recolor the mark off-token.

**Where it ships in the app**

| Surface | Status |
|---------|--------|
| App sidebar | ✅ `TeamHubLogo` horizontal |
| Marketing header | ✅ |
| Auth shell (dark + mobile) | ✅ |
| Invite layout | ✅ |
| Browser favicon | ✅ `app/icon.svg` |
| Create-workspace dialog header icon | ✅ `TeamHubLogo` mark |
| Emails (Resend HTML) | Text-only “Sameward” for now (no embedded SVG logo) |

## Design tokens

### Light

| Token | Hex |
|-------|-----|
| background | `#F7FAFC` |
| foreground | `#0F172A` |
| card | `#FFFFFF` |
| muted | `#EEF3F8` |
| muted-foreground | `#475569` |
| border / input | `#CBD8E6` |
| primary | `#0369A1` |
| primary-foreground | `#FFFFFF` |
| secondary | `#E7F1F9` |
| secondary-foreground | `#0C4A6E` |
| accent | `#E0F2FE` |
| accent-foreground | `#075985` |
| destructive | `#DC2626` |
| success | `#16A34A` |
| warning | `#D97706` |
| ring | `#0369A1` |
| brand-a / brand-b | `#0EA5E9` / `#22D3EE` |

### Dark

| Token | Hex |
|-------|-----|
| background | `#0B1220` |
| foreground | `#F1F5F9` |
| card | `#0F1A2E` |
| muted | `#16273D` |
| muted-foreground | `#94A3B8` |
| border / input | `#23344B` |
| primary | `#0EA5E9` |
| primary-foreground | `#04283B` |
| secondary | `#16273D` |
| secondary-foreground | `#E2E8F0` |
| accent | `#0C3A57` |
| accent-foreground | `#BAE6FD` |
| destructive | `#EF4444` |
| success | `#22C55E` |
| warning | `#F59E0B` |
| ring | `#38BDF8` |
| brand-a / brand-b | `#0EA5E9` / `#22D3EE` |

### Radius

- sm `6px` · md `10px` · lg `14px`
- Base `--radius: 10px` (md)
- Avoid `9999px` / `rounded-full` except rare cases (avatars)

### Spacing

4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### Shadows (minimal)

- Default: `0 1px 2px rgba(16,24,40,.06)`
- Hover: `0 6px 18px rgba(16,24,40,.08)`
- Dialog: `0 16px 40px rgba(16,24,40,.12)`
- No colored shadows

## Typography

| Role | Font | Next.js import |
|------|------|----------------|
| Headlines | **Manrope** | `Manrope` from `next/font/google` |
| Body | **Plus Jakarta Sans** | `Plus_Jakarta_Sans` |

### Type scale

| Step | Size | Weight | Line-height |
|------|------|--------|-------------|
| H1 | 56px | 700 | 1.1 |
| H2 | 40px | 700 | 1.15 |
| H3 | 28px | 650 | 1.2 |
| Body | 16px | 450 | 1.65 |
| Small | 14px | 450 | 1.5 |
| Label | 13px | 600 | 1.3 · tracking ~0.02em |

## Layout rules

### Marketing hero

Nav → one headline → one supporting sentence → primary + secondary CTA → one dominant product visual.

No metric strips, badge clouds, floating stickers on hero media.

### App shell

- Sidebar **224px** (`w-56`)
- Content max ~**1280px** (docs later ~760px)
- Top bar only when search / breadcrumbs / filters need it
- Cards only for interactive surfaces

## Component specs (summary)

| Component | Spec |
|-----------|------|
| Primary button | bg-primary, h-10, px-4, radius md, no shadow |
| Secondary | border + transparent, hover muted |
| Ghost | no border, hover muted |
| Sidebar item | hover muted; active = secondary + **4px primary (Ocean Blue) left bar**; icon 20px; label 14px medium |
| Input | h-10, border, radius md, focus ring primary |
| Empty workspace | “Create your first workspace” + Create / Import CTAs |

## CSS variables — Ocean Blue v1.1

> Source of truth is [`app/globals.css`](../../app/globals.css). Mirror below; if they diverge, `globals.css` wins.

```css
:root {
  --background: #F7FAFC;
  --foreground: #0F172A;
  --card: #FFFFFF;
  --card-foreground: #0F172A;
  --popover: #FFFFFF;
  --popover-foreground: #0F172A;
  --primary: #0369A1;
  --primary-foreground: #FFFFFF;
  --secondary: #E7F1F9;
  --secondary-foreground: #0C4A6E;
  --muted: #EEF3F8;
  --muted-foreground: #475569;
  --accent: #E0F2FE;
  --accent-foreground: #075985;
  --destructive: #DC2626;
  --border: #CBD8E6;
  --input: #CBD8E6;
  --ring: #0369A1;
  --success: #16A34A;
  --warning: #D97706;
  --radius: 10px;
  --brand-a: #0EA5E9;
  --brand-b: #22D3EE;

  --sidebar: #F1F5F9;
  --sidebar-foreground: #0F172A;
  --sidebar-primary: #0369A1;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #E0F2FE;
  --sidebar-accent-foreground: #075985;
  --sidebar-border: #CBD8E6;
  --sidebar-ring: #0369A1;
}

.dark {
  --background: #0B1220;
  --foreground: #F1F5F9;
  --card: #0F1A2E;
  --card-foreground: #F1F5F9;
  --popover: #0F1A2E;
  --popover-foreground: #F1F5F9;
  --primary: #0EA5E9;
  --primary-foreground: #04283B;
  --secondary: #16273D;
  --secondary-foreground: #E2E8F0;
  --muted: #16273D;
  --muted-foreground: #94A3B8;
  --accent: #0C3A57;
  --accent-foreground: #BAE6FD;
  --destructive: #EF4444;
  --border: #23344B;
  --input: #23344B;
  --ring: #38BDF8;
  --success: #22C55E;
  --warning: #F59E0B;
  --brand-a: #0EA5E9;
  --brand-b: #22D3EE;

  --sidebar: #0B1220;
  --sidebar-foreground: #F1F5F9;
  --sidebar-primary: #0EA5E9;
  --sidebar-primary-foreground: #04283B;
  --sidebar-accent: #0C3A57;
  --sidebar-accent-foreground: #BAE6FD;
  --sidebar-border: #23344B;
  --sidebar-ring: #38BDF8;
}
```

Hex is fine for v1. OKLCH can come later if we want perceptual tweaks.

### Brand gradient utilities (in `globals.css @layer utilities`)

All derive from `--brand-a` / `--primary` / `--warning`, so they follow the palette:

| Utility | Use |
|---------|-----|
| `bg-hero-grid` | Faint blueprint grid for marketing hero (no aurora) |
| `bg-brand-panel` | Rich branded dark panel for the auth split-screen |
| `btn-brand-gradient` | Gradient fill layered over a solid button |
| `bg-brand-wash` | Soft top wash for empty / status sections |
| `brand-tile` | Branded icon tile for positive empty states |

## Implementation checklist

- [x] Replace `:root` / `.dark` tokens in `app/globals.css` (Ocean Blue v1.1)
- [x] Align sidebar tokens with shell
- [x] Swap Geist → Manrope + Plus Jakarta Sans in `app/layout.tsx`
- [x] Wire `--font-heading` / `--font-sans` in `@theme`
- [x] Update Sidebar active state (primary bar) to match spec
- [x] Marketing header + hero (Phase 1 UI)
- [x] Workspace empty state (Phase 1 UI)

## Mentor notes

- Mockups are **direction**, not pixel law. Prefer tokens + layout rules over copying every AI chrome widget.
- “Trusted by” logo rows / floating AI bubbles can wait; hero stays one composition.
- Keep building on route groups + shell you already have.

---

[← Docs hub](../README.md)
