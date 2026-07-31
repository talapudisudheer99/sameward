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

let Workspace: Model<WorkspaceDocument>

if (models.Workspace) {
  Workspace = models.Workspace as Model<WorkspaceDocument>
} else {
  Workspace = model<WorkspaceDocument>("Workspace", workspaceSchema)
}

export { Workspace }
