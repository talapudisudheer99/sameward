# Mongoose guide (TeamHub)

Quick mental model for this project. Auth models live under `lib/models/`.  
Auth usage: [../auth/LIB-AND-MODELS.md](../auth/LIB-AND-MODELS.md).

## Mental model

```text
MongoDB Atlas          = database server (cloud)
Database "teamhub"     = one app’s data
Collection "users"     = table-like bag of documents
Document               = one row/object { email, passwordHash, ... }

Mongoose               = ODM
  Schema               = shape + validation for a collection
  Model                = User.create(), User.findOne(), …
```

**Express vs Next:** same Mongoose. We connect inside **Route Handlers** / server helpers, not `app.listen`.

## Native driver vs Mongoose

| | Native `mongodb` | **Mongoose** (our choice) |
|--|------------------|---------------------------|
| You write | raw collections | Schema + Model |
| Validation | manual / Zod only | Schema + Zod (both) |
| Relations | manual refs | `ref` + `populate` later |

**Zod** = request/form shape. **Mongoose Schema** = DB document shape.

## Connection pattern

File: `lib/db/mongoose.ts`

- Cache connection on `global` so Next.js hot reload doesn’t open endless sockets
- `dbName: "teamhub"` in code (URI need not include DB path)
- Always `await connectDB()` before queries

Smoke check: `GET /api/health/db` → `{ ok, db: "teamhub", readyState: 1 }`

## Model pattern

```ts
export const User = models.User ?? model("User", userSchema)
```

Next.js hot reload can keep a **stale** model without new fields. For `User` we clear the cache in non-production when needed (see `lib/models/user.ts`).

## Auth-related collections

| Model | Role |
|-------|------|
| User | Accounts |
| Session | Logged-in devices |
| PasswordResetToken | Reset links |
| EmailVerificationToken | Verify links |
| AuthEvent | Security audit |

TTL: `expiresAt` fields with `expires: 0` let Mongo delete expired token/session docs.
