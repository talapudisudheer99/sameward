# Security — Profiles

1. **Self-only writes** — PATCH/avatar require session; never accept another user’s id.  
2. **Teammate read** — both viewer and subject must be members of `workspaceId` → else **404**.  
3. **Email** — returned only on teammate/self profile APIs, never on a public unauthenticated route.  
4. **Avatar URLs** — `isManagedObjectUrl`; key must be under `users/{self}/avatar/`.  
5. **Links** — `https?` only; max 2; no javascript: URLs.

---

[← Lib](./LIB-AND-MODELS.md) · [Tasks →](./TASKS.md)
