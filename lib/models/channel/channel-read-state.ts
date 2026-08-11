import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "@/lib/db/mongoose-ns"
import type { Types } from "mongoose"

/**
 * Per-user read cursor for a channel (public or private).
 *
 * Unread = messages with createdAt > lastReadAt and authorId ≠ this user.
 * Not stored on ChannelMembership — public channels have no membership rows.
 */
const channelReadStateSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastReadAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

channelReadStateSchema.index({ channelId: 1, userId: 1 }, { unique: true })

export type ChannelReadStateDocument = InferSchemaType<
  typeof channelReadStateSchema
> & {
  _id: Types.ObjectId
}

let ChannelReadState: Model<ChannelReadStateDocument>

if (models.ChannelReadState) {
  ChannelReadState = models.ChannelReadState as Model<ChannelReadStateDocument>
} else {
  ChannelReadState = model<ChannelReadStateDocument>(
    "ChannelReadState",
    channelReadStateSchema
  )
}

export { ChannelReadState }
