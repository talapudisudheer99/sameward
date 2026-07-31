import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * Append-only tenant audit trail (separate from AuthEvent).
 * Who did what inside a workspace — invite, remove, delete, etc.
 */
const workspaceEventSchema = new Schema(
  {
    event: {
      type: String,
      required: true,
      index: true, // e.g. "workspace.created", "member.removed"
    },
    success: {
      type: Boolean,
      required: true,
    },
    // Tenant scope — query "everything that happened in this workspace"
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    // Who performed the action
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Who was affected (remove / role change)
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Invitee email when userId isn’t known yet / useful for invite.sent
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
)

// Timeline per workspace + global recent feed
workspaceEventSchema.index({ workspaceId: 1, createdAt: -1 })
workspaceEventSchema.index({ createdAt: -1 })

export type WorkspaceEventDocument = InferSchemaType<
  typeof workspaceEventSchema
> & {
  _id: Types.ObjectId
}

let WorkspaceEvent: Model<WorkspaceEventDocument>

if (models.WorkspaceEvent) {
  WorkspaceEvent = models.WorkspaceEvent as Model<WorkspaceEventDocument>
} else {
  // Must be "WorkspaceEvent" — never reuse "AuthEvent" (wrong collection)
  WorkspaceEvent = model<WorkspaceEventDocument>(
    "WorkspaceEvent",
    workspaceEventSchema
  )
}

export { WorkspaceEvent }
