import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "@/lib/db/mongoose-ns"
import type { Types } from "mongoose"

/**
 * Who can see / post in this channel (within a workspace).
 * public  → any workspace member
 * private → only ChannelMembership rows (+ still need workspace membership)
 * dm      → 1:1 Direct message; membership for exactly two users
 */
export enum ChannelVisibility {
  Public = "public",
  Private = "private",
  Dm = "dm",
}

/**
 * One document = one discussion room inside a workspace.
 * Messages live in a separate collection (scale + pagination).
 */
const channelSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    // Display name — UI often shows "# general"; DMs use peer name in API JSON
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    // URL/key unique *inside* this workspace only (general, hiring, dm-…)
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    visibility: {
      type: String,
      enum: Object.values(ChannelVisibility),
      required: true,
      default: ChannelVisibility.Public,
    },
    // True for the auto-created #general
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * 1:1 DM only — sorted `${minUserId}_${maxUserId}` so the pair is unique
     * per workspace. Sparse unique index ignores non-DM channels.
     */
    dmPairKey: {
      type: String,
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
)

// Same slug can exist in two workspaces — not globally unique
channelSchema.index({ workspaceId: 1, slug: 1 }, { unique: true })
channelSchema.index(
  { workspaceId: 1, dmPairKey: 1 },
  { unique: true, sparse: true }
)

export type ChannelDocument = InferSchemaType<typeof channelSchema> & {
  _id: Types.ObjectId
}

export const Channel: Model<ChannelDocument> =
  (models.Channel as Model<ChannelDocument>) ||
  model<ChannelDocument>("Channel", channelSchema)
