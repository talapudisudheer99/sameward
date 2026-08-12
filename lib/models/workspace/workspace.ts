import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * One document = one team home (tenant).
 * Members are NOT embedded here — see Membership for who belongs.
 */
const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    // URL-safe unique key derived from name (acme-inc, acme-inc-2, …)
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    /** Optional short note — what this workspace is for (members see it) */
    description: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    // Who created it — permissions / billing root later
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

export type WorkspaceDocument = InferSchemaType<typeof workspaceSchema> & {
  _id: Types.ObjectId
}

// Dev HMR can keep a stale schema without `description` — clear like User.
if (process.env.NODE_ENV !== "production" && models.Workspace) {
  delete models.Workspace
}

export const Workspace: Model<WorkspaceDocument> =
  (models.Workspace as Model<WorkspaceDocument>) ??
  model<WorkspaceDocument>("Workspace", workspaceSchema)
