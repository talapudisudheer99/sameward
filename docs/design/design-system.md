# TeamHub AI — Visual Identity & Design System v1.0

> Reference mockups: [references/teamhub-ui-mockups-v1.png](./references/teamhub-ui-mockups-v1.png)  
> Logo system: [references/teamhub-logo-system.png](./references/teamhub-logo-system.png)  
> Channels chat components: [references/channels-mockups-dialogs.png](./references/channels-mockups-dialogs.png)

## Brand summary

TeamHub AI is a collaboration platform for teams that spend their workday in one app. Clarity over excitement. Confidence over novelty. **Engineered, not decorated.**

| Do | Don’t |
|----|--------|
| Generous whitespace | Gradient overload |
| Strong hierarchy | Neon “AI” aesthetics |
| Restrained color (one accent) | Playful blobs / sticker UI |
| Clean typography | Pills everywhere |
| Subtle motion | Decorative shadows |
| Obvious interactions | Purple / indigo / cream-terracotta clichés |

**Voice:** “Everything has its place.” — not “Look how futuristic our AI is.”

**Accent:** Electric Teal `#0F9D94` (dark: `#19B6AC`) — one accent only.

## Logo

**Mark:** Teal hexagon with three white team silhouettes (collaboration).  
**Wordmark:** `TeamHub` in Ink `#111827` + `AI` in Electric Teal.  
**Component:** `components/layout/teamhub-logo.tsx`

| Variant | Use |
|---------|-----|
| `mark` | Favicon-style, collapsed chrome |
| `horizontal` | Headers, sidebar, marketing (default for nav) |
| `stacked` | Centered / tight vertical spaces |
| `tone="onDark"` | Navy marketing panels (white TeamHub + teal AI) |

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
| Emails (Resend HTML) | Text-only “TeamHub” for now (no embedded SVG logo) |

## Design tokens

### Light

| Token | Hex |
|-------|-----|
| background | `#F7F9FB` |
| foreground | `#111827` |
| card | `#FFFFFF` |
| muted | `#EEF2F6` |
| muted-foreground | `#64748B` |
| border / input | `#D9E2EC` |
| primary | `#0F9D94` |
| primary-foreground | `#FFFFFF` |
| secondary | `#E8F5F4` |
| accent | `#12B5A8` |
| destructive | `#DC2626` |
| success | `#16A34A` |
| warning | `#D97706` |
| ring | `#0F9D94` |

### Dark

| Token | Hex |
|-------|-----|
| background | `#111827` |
| foreground | `#F8FAFC` |
| card | `#1A2333` |
| muted | `#253041` |
| muted-foreground | `#94A3B8` |
| border / input | `#314155` |
| primary | `#19B6AC` |
| primary-foreground | `#081513` |
| secondary | `#203B39` |
| accent | `#25C4B7` |
| destructive | `#EF4444` |
| success | `#22C55E` |
| warning | `#F59E0B` |
| ring | `#19B6AC` |

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
| Sidebar item | hover muted; active = secondary + **4px teal left bar**; icon 20px; label 14px medium |
| Input | h-10, border, radius md, focus ring primary |
| Empty workspace | “Create your first workspace” + Create / Import CTAs |

## CSS variables (implement in `globals.css`)

```css
:root {
  --background: #F7F9FB;
  --foreground: #111827;
  --card: #FFFFFF;
  --card-foreground: #111827;
  --popover: #FFFFFF;
  --popover-foreground: #111827;
  --primary: #0F9D94;
  --primary-foreground: #FFFFFF;
  --secondary: #E8F5F4;
  --secondary-foreground: #111827;
  --muted: #EEF2F6;
  --muted-foreground: #64748B;
  --accent: #12B5A8;
  --accent-foreground: #FFFFFF;
  --destructive: #DC2626;
  --border: #D9E2EC;
  --input: #D9E2EC;
  --ring: #0F9D94;
  --radius: 10px;

  --sidebar: #F7F9FB;
  --sidebar-foreground: #111827;
  --sidebar-primary: #0F9D94;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #E8F5F4;
  --sidebar-accent-foreground: #111827;
  --sidebar-border: #D9E2EC;
  --sidebar-ring: #0F9D94;
}

.dark {
  --background: #111827;
  --foreground: #F8FAFC;
  --card: #1A2333;
  --card-foreground: #F8FAFC;
  --popover: #1A2333;
  --popover-foreground: #F8FAFC;
  --primary: #19B6AC;
  --primary-foreground: #081513;
  --secondary: #203B39;
  --secondary-foreground: #F8FAFC;
  --muted: #253041;
  --muted-foreground: #94A3B8;
  --accent: #25C4B7;
  --accent-foreground: #081513;
  --destructive: #EF4444;
  --border: #314155;
  --input: #314155;
  --ring: #19B6AC;

  --sidebar: #111827;
  --sidebar-foreground: #F8FAFC;
  --sidebar-primary: #19B6AC;
  --sidebar-primary-foreground: #081513;
  --sidebar-accent: #203B39;
  --sidebar-accent-foreground: #F8FAFC;
  --sidebar-border: #314155;
  --sidebar-ring: #19B6AC;
}
```

Hex is fine for v1. OKLCH can come later if we want perceptual tweaks.

## Implementation checklist

- [ ] Replace `:root` / `.dark` tokens in `app/globals.css`
- [ ] Align sidebar tokens with shell
- [ ] Swap Geist → Manrope + Plus Jakarta Sans in `app/layout.tsx`
- [ ] Wire `--font-heading` / `--font-sans` in `@theme`
- [ ] Update Sidebar active state (teal bar) to match spec
- [ ] Marketing header + hero (Phase 1 UI)
- [ ] Workspace empty state (Phase 1 UI)

## Mentor notes

- Mockups are **direction**, not pixel law. Prefer tokens + layout rules over copying every AI chrome widget.
- “Trusted by” logo rows / floating AI bubbles can wait; hero stays one composition.
- Keep building on route groups + shell you already have.

---

[← Docs hub](../README.md)
