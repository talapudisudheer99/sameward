# Lib & models — Profiles

```text
lib/models/user.ts              # + avatarUrl, title, bio, timezone, links[]
lib/types/profile/profile-types.ts
lib/schemas/profile/update-profile-schema.ts
lib/schemas/profile/avatar-presign-schema.ts
lib/profile/serialize-profile.ts
lib/storage/s3.ts               # + buildAvatarKey
app/api/auth/me/route.ts        # GET + PATCH
app/api/auth/me/avatar/route.ts # POST presign
app/api/workspaces/.../profiles/[userId]/route.ts
store/api/profile/profile-api.ts
components/profile/*
```

Avatar keys: `users/{userId}/avatar/{uuid}-{safeName}`  
Reuse `presignAttachmentPut` / `presignAttachmentGet` / `uploadFilesToS3` (single file).

---

[← Frontend](./FRONTEND.md) · [Security →](./SECURITY.md)
