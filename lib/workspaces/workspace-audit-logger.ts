import { connectDB } from "@/lib/db/mongoose"
import { WorkspaceEvent } from "@/lib/models/workspace/workspace-event"
import type { WorkspaceAuditEventName } from "@/lib/workspaces/workspace-audit-events"

/**
 * Best-effort workspace audit logger (same contract as logAuthEvent).
 * Never throws — observability must not break invite / leave / delete.
 */
export async function logWorkspaceEvent(input: {
  event: WorkspaceAuditEventName | string
  success: boolean
  workspaceId?: string
  actorUserId?: string
  targetUserId?: string
  email?: string
  reason?: string
}): Promise<void> {
  const payload = {
    event: input.event,
    success: input.success,
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    targetUserId: input.targetUserId,
    email: input.email,
    reason: input.reason,
  }

  try {
    await connectDB()
    await WorkspaceEvent.create(payload)

    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify({ type: "workspace_event", ...payload }))
    }
  } catch (error) {
    // Swallow — same rule as auth audit
    console.error("Failed to log workspace event:", error)
  }
}
