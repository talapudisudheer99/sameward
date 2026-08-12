# Marketing image prompts (landing)

**Shipped hero on `/`:** live React mock — `components/marketing/product-ui-mock.tsx`  
(workspaces + channels + chat peek + profile + Channel AI). No static collage is required.

Optional lifestyle photos may still go under `public/marketing/` (see [`public/marketing/README.md`](../../public/marketing/README.md)).

**Brand locks for every prompt**
- Ocean Blue UI (`#0369A1` / sky accents), white/light gray surfaces  
- Clean SaaS product UI — **not** purple, neon glow, or cream-terracotta  
- No fake logos that aren’t TeamHub; no unreadable lorem in giant type  
- Prefer real app chrome over photoreal invented UIs  

---

## 1) Optional collage asset (if regenerating)

Only needed if you want a JPG fallback instead of `ProductUiMock`.  
**Save as:** `public/marketing/product-hero.jpg` (16:9 or 21:9)

```text
Create a premium B2B SaaS marketing hero image for TeamHub AI.

STRICT — DO NOT CHANGE
- Logo: Keep the TeamHub AI logo EXACTLY as in the attached reference. Same rounded blue squircle mark with three white team silhouettes. Same wordmark: “TeamHub” (dark) + “AI” (Ocean Blue). Do not redesign, recolor, distort, or invent a different logo.
- Product name: only “TeamHub AI” — no other brand names.
- Features must match this product ONLY:
  1) Workspaces — list/tiles of team workspaces
  2) Channels — public (#) and private (lock) + 1:1 DMs
  3) Chat — messages, unread cues, @mentions, attachments, composer
  4) Profiles — teammate card
  5) Channel AI — Summarize, Catch up, Ask, Draft, Notes (read-only)
- Do not invent Threads/Home feed as primary nav.

MUST SHOW
- One cohesive marketing composition with layered product surfaces.
- Ocean Blue brand, light UI, calm premium energy.

FORBIDDEN
- Purple, neon glow, cyberpunk, cream-terracotta “AI poster” look.
- Fake logos, stickers, badges, promo ribbons on the hero.

Aspect: wide 16:9 or 21:9, high resolution.
```

---

## 2) Optional lifestyle — `hero-team.jpg`

**Aspect:** 4:3 or 16:9

```text
Editorial photo of a small product team collaborating around a laptop in a bright modern office.
Natural daylight, calm blues and neutrals. Soft-focus chat UI with blue accents on screen.
No logos, no text overlays, no purple lighting.
```

---

## 3) Optional solutions — `solutions-remote.jpg`

**Aspect:** 16:9

```text
Wide lifestyle photo: remote engineer at a clean desk, soft morning light.
One monitor shows a light-mode team chat app with blue accents (blurred).
Calm B2B SaaS feel. No purple, no cyberpunk, no neon.
```

After generating, place files in `public/marketing/` and hard-refresh `/`.
