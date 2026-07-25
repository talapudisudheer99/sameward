import { NextResponse } from "next/server"
import mongoose from "mongoose"

import { connectDB } from "@/lib/db/mongoose"

/**
 * Smoke test: GET /api/health/db
 * Confirms env + Atlas network + Mongoose connection.
 */
export async function GET() {
  try {
    await connectDB()

    const readyState = mongoose.connection.readyState
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const ok = readyState === 1

    return NextResponse.json(
      {
        ok,
        db: mongoose.connection.name,
        readyState,
      },
      { status: ok ? 200 : 503 }
    )
  } catch (error) {
    console.error("DB health check failed:", error)

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
