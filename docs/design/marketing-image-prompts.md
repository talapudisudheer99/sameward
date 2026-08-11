# Marketing image prompts (landing)

**Product UI on `/`:** live React mock `components/marketing/product-ui-mock.tsx` —
one composition: **workspaces + channels + chat peek + profile + Channel AI**.
Chat is not the whole hero. Do **not** paste AI-generated Slack clones.

Optional lifestyle photos below may still go under `public/marketing/`.

**Brand locks for every prompt**
- Ocean Blue UI (`#0369A1` / sky accents), white/light gray surfaces  
- Clean SaaS product UI — **not** purple, neon glow, or cream-terracotta  
- No fake logos that aren’t TeamHub; no unreadable lorem in giant type  
- Prefer real app chrome over photoreal invented UIs  

---

## 1) Hero / product collage — GPT image prompt (preferred)

**Attach:** TeamHub logo PNG + 1–2 real app screenshots (workspaces list, channel chat, profile, Channel AI).  
**Save as:** `public/marketing/product-hero.jpg` (16:9 or 21:9)

```text
Create a premium B2B SaaS marketing hero image for TeamHub AI.

STRICT — DO NOT CHANGE
- Logo: Keep the TeamHub AI logo EXACTLY as in the attached reference. Same rounded blue squircle mark with three white team silhouettes. Same wordmark: “TeamHub” (dark) + “AI” (Ocean Blue). Do not redesign, recolor, distort, or invent a different logo.
- Product name: only “TeamHub AI” — no other brand names.
- Features must match this product ONLY (do not invent Slack-like items such as Threads, Mentions, Drafts, Home feed, or Direct Messages as primary nav):
  1) Workspaces — list/tiles of team workspaces (name, role Owner/Admin/Member, short description)
  2) Channels — public (#) and private (lock) channels inside a workspace
  3) Chat — channel messages with members, attachments (images/PDFs), composer
  4) Profiles — teammate card: display name, title/role, short bio, timezone
  5) Channel AI — tools labeled Summarize, Catch up, Ask, Draft, Notes; copy like “Read-only · nothing is posted for you”; user always sends messages themselves
- Do not rename features. Do not add boards/docs as fake screens unless soft/blurred atmosphere only.

MUST SHOW (engaging feature collage)
- One cohesive marketing composition (not a boring single screenshot, not a flat dashboard of cards).
- Layered floating product surfaces / glass panels arranged with depth and motion feel: workspaces panel + channels/chat peek + profile card + Channel AI panel — all readable enough to understand features.
- Ocean Blue brand (#0369A1 / sky accents), light UI, white/cool gray surfaces.
- Soft depth, subtle shadows, calm premium energy. Engaging and modern.

ALLOWED TO IMPROVE
- Layout, perspective, lighting, background atmosphere, spacing, typography styling of UI chrome (as long as labels stay correct).
- Abstract soft gradients / soft studio background behind the UI — cool blues and neutrals only.
- Tasteful depth-of-field: secondary panels slightly softer; primary feature panels sharper.

FORBIDDEN
- Purple, neon glow, cyberpunk, cream-terracotta “AI poster” look.
- Fake logos, stickers, badges, promo ribbons, emoji clutter on the hero.
- Unreadable giant lorem, random metrics walls, calendar/schedule widgets.
- Changing logo shape, colors, or wordmark.

Aspect: wide 16:9 or 21:9, high resolution, marketing quality.
```

---

## 2) Optional hero alternate — `hero-team.jpg` (optional)

**Aspect:** 4:3 or 16:9

```text
Editorial photo of a small product team collaborating around a laptop in a bright modern office.
Natural daylight, calm blues and neutrals in clothing and room, no neon.
Laptop screen shows a soft-focus chat UI with blue accents (unreadable detail OK).
Shallow depth of field, confident professional mood, not startup sticker aesthetic.
No logos, no text overlays, no purple lighting.
```

---

## 3) Optional solutions — `solutions-remote.jpg` (optional)

**Aspect:** 16:9

```text
Wide lifestyle photo: remote engineer at a clean desk with dual monitors, soft morning light.
One monitor shows a light-mode team chat app with blue accents (blurred).
Minimal desk, plants subtle, Ocean Blue mug or notebook accent only.
Calm, focused, premium B2B SaaS feel. No purple, no cyberpunk, no neon.
```

After generating, place files in `public/marketing/` and hard-refresh `/`.
