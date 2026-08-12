import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "@/lib/db/mongoose-ns"
import type { Types } from "mongoose"

// String enum = runtime values + TypeScript type in one
export enum MembershipRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}

/**
 * One document = one user belonging to one workspace (with a role).
 * Many-to-many bridge: User ↔ Workspace.
 */
const membershipSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MembershipRole),
      required: true,
    },
  },
  { timestamps: true }
)

// One person can only be in a workspace once , compound unique index
membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true })

export type MembershipDocument = InferSchemaType<typeof membershipSchema> & {
  _id: Types.ObjectId
}

let Membership: Model<MembershipDocument>

if (models.Membership) {
  Membership = models.Membership as Model<MembershipDocument>
} else {
  Membership = model<MembershipDocument>("Membership", membershipSchema)
}

export { Membership }
