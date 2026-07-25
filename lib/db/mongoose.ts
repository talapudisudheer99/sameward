import mongoose from "mongoose"

/**
 * Next.js + Mongoose connection helper.
 * - Reads MONGODB_URI from .env.local
 * - Uses dbName: "teamhub" (Option B)
 * - Caches connection on globalThis so hot-reload doesn't open dozens of connections
 */

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env.local and restart npm run dev."
    )
  }
  return uri
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// for global typescript
declare global {
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}
global.mongooseCache = cached

// Stale cache after a failed/dropped connection — force a fresh connect attempt.
export async function connectDB() {
  // 1 = connected — reuse. Otherwise reconnect (Atlas can drop after TLS/network blips).
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  // Stale cache after a failed/dropped connection — force a fresh connect attempt.
  cached.conn = null
  cached.promise = null

  const uri = getMongoUri()
  cached.promise = mongoose.connect(uri, {
    dbName: "teamhub",
    bufferCommands: false,
  })

  cached.conn = await cached.promise
  return cached.conn
}
