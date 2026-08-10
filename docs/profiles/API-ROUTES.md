# API routes — Profiles

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| GET | `/api/auth/me` | self | Session user **+** profile fields (avatar URL signed) |
| PATCH | `/api/auth/me` | self | Update `fullName`, `title`, `bio`, `timezone`, `links`, clear avatar |
| POST | `/api/auth/me/avatar` | self | Presign PUT for one image (≤2MB · jpeg/png/webp) |
| GET | `/api/workspaces/:workspaceId/profiles/:userId` | workspace member | Teammate card (includes `email`) |

### PATCH body

```json
{
  "fullName": "Sudheer Talapudi",
  "title": "Full-stack engineer",
  "bio": "Building TeamHub AI.",
  "timezone": "Asia/Kolkata",
  "links": [{ "label": "GitHub", "url": "https://github.com/…" }],
  "avatarUrl": null
}
```

Omit fields you don’t change. `avatarUrl: null` clears. Non-null `avatarUrl` must be a managed S3 URL from our avatar presign.

### GET teammate response

```json
{
  "profile": {
    "id": "…",
    "fullName": "…",
    "email": "…",
    "title": "…",
    "bio": "…",
    "timezone": "…",
    "links": [],
    "avatarUrl": "https://…presigned…"
  }
}
```

---

[← Stories](./USER-STORIES.md) · [Frontend →](./FRONTEND.md)
