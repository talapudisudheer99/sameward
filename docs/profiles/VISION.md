# Vision — Profile v1

## One-line vision

A TeamHub user has a **thin professional card** so teammates can answer “who is this?” in five seconds.

## Mission

Account creation today stores `fullName` + `email`. In a channel you only see a name.  
Profile v1 adds just enough identity for collaboration — without becoming a social network.

**Emotion after v1:** *“I know what they do on this team,”* not *“I browsed their career.”*

## PO locks

| # | Decision |
|---|----------|
| 1 | Fields: `fullName`, `avatarUrl`, `title`, `bio`, `timezone`, `links[]` (max 2) |
| 2 | Edit own at `/profile`; view others via card (dialog) |
| 3 | View requires **shared workspace membership**; email only then |
| 4 | Avatar via S3 presign (images only, small cap); initials fallback |
| 5 | No public profile URLs outside the app |

## In scope

- Extend `User` + `GET/PATCH /api/auth/me`
- Avatar presign `POST /api/auth/me/avatar`
- Teammate fetch `GET /api/workspaces/:id/profiles/:userId`
- Edit form + avatar upload
- Click name/avatar in members / channel members / message author → card

## Out of scope

- Posts, activity feed, endorsements, org chart  
- Skills taxonomies, open graph public pages  
- Changing email/password here (auth module owns that)  
- Presence status on the card (already live elsewhere)

---

[← README](./README.md) · [Stories →](./USER-STORIES.md)
