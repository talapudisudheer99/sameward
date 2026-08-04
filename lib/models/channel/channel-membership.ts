import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * Extra key for a *private* channel.
 *
 * Public channels do NOT get rows here — workspace Membership is enough.
 * Private channels: must have Workspace Membership AND a row here (channel membership).
 *
 * workspaceId is denormalized so we can query
 * “private channels for this user in this workspace” without joining Channel first.
 */
const channelMembershipSchema = new Schema(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
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
  },
  { timestamps: true }
)

// One person once per private channel
channelMembershipSchema.index({ channelId: 1, userId: 1 }, { unique: true })

export type ChannelMembershipDocument = InferSchemaType<
  typeof channelMembershipSchema
> & {
  _id: Types.ObjectId
}

let ChannelMembership: Model<ChannelMembershipDocument>

if (models.ChannelMembership) {
  ChannelMembership =
    models.ChannelMembership as Model<ChannelMembershipDocument>
} else {
  ChannelMembership = model<ChannelMembershipDocument>(
    "ChannelMembership",
    channelMembershipSchema
  )
}

export { ChannelMembership }
