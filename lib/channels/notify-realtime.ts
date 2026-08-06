/**
 * Next → realtime fan-out after a successful write (Mongo is still the source of truth).
 *
 * Env:
 * - REALTIME_URL — e.g. http://localhost:4001
 * - REALTIME_INTERNAL_SECRET — must match the realtime process
 *
 * Failures are logged only — never roll back the message.
 */
export async function notifyRealtime(args: {
  room: string
  event: string
  payload: unknown
}): Promise<void> {
  const baseUrl = (process.env.REALTIME_URL ?? "http://localhost:4001").replace(
    /\/$/,
    ""
  )

  const secret = process.env.REALTIME_INTERNAL_SECRET

  if (!secret) {
    console.warn("[notifyRealtime] REALTIME_INTERNAL_SECRET unset — skip emit")
    return
  }

  try {
    const res = await fetch(`${baseUrl}/internal/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-realtime-secret": secret,
      },

      body: JSON.stringify({
        room: args.room,
        event: args.event,
        payload: args.payload,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(
        `[notifyRealtime] emit failed status=${res.status} body=${text}`
      )
    }
  } catch (err) {
    console.error("[notifyRealtime] emit error:", err)
  }
}
