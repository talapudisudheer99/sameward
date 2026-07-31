import { connectDB } from "@/lib/db/mongoose"
import { AuthEvent } from "@/lib/models/auth-event"

export async function logAuthEvent(input: {
  event: string
  success: boolean
  email?: string
  userId?: string
  ip?: string
  reason?: string
}): Promise<void> {
  const payload = {
    event: input.event,
    success: input.success,
    email: input.email,
    userId: input.userId,
    ip: input.ip,
    reason: input.reason,
  }

  try {
    await connectDB()
    await AuthEvent.create(payload)

    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify({ type: "auth_event", ...payload }))
    }
  } catch (error) {
    // Best-effort only — never break login/signup because logging failed
    console.error("Failed to log auth event:", error)
  }
}
