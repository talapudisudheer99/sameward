import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * Who can see / post in this channel (within a workspace).
 * public  → any workspace member
 * private → only ChannelMembership rows (+ still need workspace membership)
 */
export enum ChannelVisibility {
  Public = "public",
  Private = "private",
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
    // Display name — UI often shows "# general"
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    // URL/key unique *inside* this workspace only (general, hiring, …)
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
  },
  { timestamps: true }
)

// Same slug can exist in two workspaces — not globally unique
channelSchema.index({ workspaceId: 1, slug: 1 }, { unique: true })

export type ChannelDocument = InferSchemaType<typeof channelSchema> & {
  _id: Types.ObjectId
}

let Channel: Model<ChannelDocument>

if (models.Channel) {
  Channel = models.Channel as Model<ChannelDocument>
} else {
  Channel = model<ChannelDocument>("Channel", channelSchema)
}

export { Channel }
