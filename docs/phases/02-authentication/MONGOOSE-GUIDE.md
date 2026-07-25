# Mongoose refresh (Phase 2)

> You’ve been away from Node/Mongo — we relearn **one layer at a time**. Syntax comes back through small tasks.

## Mental model (concepts you remember)

```text
MongoDB Atlas          = database server (cloud)
Database "teamhub"     = one app’s data
Collection "users"     = table-like bag of documents
Document               = one row/object { email, passwordHash, ... }

Mongoose               = ODM (Object Document Mapper)
  Schema               = shape + validation rules for a collection
  Model                = class you call: User.create(), User.findOne()
```

**Express vs Next:** same Mongoose. Difference = we connect inside **Route Handlers**, not `app.listen`.

---

## Native driver vs Mongoose

| | Native `mongodb` | **Mongoose** (our choice) |
|--|------------------|---------------------------|
| You write | raw collections | Schema + Model |
| Validation | manual / Zod only | Schema + Zod (both) |
| Relations | manual refs | `ref` + `populate` later |
| Learning | lower level | closer to typical Node jobs |

We still use **Zod at the API boundary** (request shape). Mongoose Schema = **DB document shape**.

---

## Phase 2 plan with Mongoose

| Step | Focus | Files |
|------|--------|--------|
| **1** | Connect once (cached) | `lib/db/mongoose.ts` |
| **2** | `User` model | `lib/models/user.ts` |
| **3** | Password hash helpers | `lib/auth/password.ts` |
| **4** | Signup route | `app/api/auth/signup/route.ts` |
| **5** | Session model + cookie | `lib/models/session.ts`, `lib/auth/*` |
| **6+** | Login, middleware, logout | as in E2E-FLOW |

Package installed: **`mongoose`** (v9). Prefer this over raw `mongodb` for this project.

---

## Step 1 — connection syntax (copy the idea, write the file)

**File:** `lib/db/mongoose.ts` (rename from empty `mongodb.ts` or replace it)

```ts
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env.local")
}


interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

global.mongooseCache = cached

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "teamhub", // Option B — DB name in code
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
```

**Why `global` cache?**  
Next.js hot-reloads in dev. Without cache you’d open many connections.

**Why `dbName: "teamhub"`?**  
Option B — URI has no DB path; Mongoose selects `teamhub`.

---

## Step 2 preview (don’t write yet — just relearn the words)

```ts
import { Schema, models, model } from "mongoose"

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true } // createdAt, updatedAt
)

// Next.js hot reload: reuse existing model if already compiled
export const User = models.User ?? model("User", userSchema)
```

Collection name defaults to plural lowercase: **`users`**.

---

## How you’ll use it in a Route Handler

```ts
import { connectDB } from "@/lib/db/mongoose"
import { User } from "@/lib/models/user"

export async function POST() {
  await connectDB()
  const user = await User.create({ ... })
  // ...
}
```

Always `await connectDB()` at the start of handlers that touch the DB.

---

## Your task right now (Step 1 only)

1. Keep `MONGODB_URI` in `.env.local` (no DB name in path — Option B)  
2. Delete or replace empty `lib/db/mongodb.ts`  
3. Create **`lib/db/mongoose.ts`** with the connection pattern above  
4. Create **`app/api/health/db/route.ts`**:

```ts
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import mongoose from "mongoose"

export async function GET() {
  await connectDB()
  return NextResponse.json({
    ok: true,
    db: mongoose.connection.name,
    readyState: mongoose.connection.readyState, // 1 = connected
  })
}
```

5. Restart `npm run dev` → open `/api/health/db`

Expect something like: `{ ok: true, db: "teamhub", readyState: 1 }`

---

Paste **`lib/db/mongoose.ts`** only when ready (no secrets). We’ll review, then Step 2: User model syntax walkthrough.
