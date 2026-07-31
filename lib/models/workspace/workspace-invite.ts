import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * One pending (or accepted) invite to join a workspace by email.
 * Raw token lives only in the email link — we store tokenHash.
 */
const workspaceInviteSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    // Must match User.email style so lookups are consistent
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Mongo TTL: delete the doc when expiresAt is in the past
      expires: 0,
    },
    // null = still pending; set on accept
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Only ONE pending invite per workspace + email (accepted rows can stay for audit)
//Create a unique database index using the combination of workspaceId and email, but apply this uniqueness rule only to documents where acceptedAt is null (pending invites).
workspaceInviteSchema.index(
  { workspaceId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { acceptedAt: null },
  }
)

export type WorkspaceInviteDocument = InferSchemaType<
  typeof workspaceInviteSchema
> & {
  _id: Types.ObjectId
}

let WorkspaceInvite: Model<WorkspaceInviteDocument>

if (models.WorkspaceInvite) {
  WorkspaceInvite = models.WorkspaceInvite as Model<WorkspaceInviteDocument>
} else {
  WorkspaceInvite = model<WorkspaceInviteDocument>(
    "WorkspaceInvite",
    workspaceInviteSchema
  )
}

export { WorkspaceInvite }
