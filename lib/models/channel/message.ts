import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

/**
 * One attachment on a message — bytes live in S3; we only store metadata + URL.
 * Enforce count/size/MIME in Zod + route (not only here).
 */
const messageAttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    mime: { type: String, required: true, trim: true },
    sizeBytes: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

/**
 * What was said in a channel — Mongo is the source of truth.
 * Socket.IO later only announces "message:new" after a successful write.
 *
 * parentMessageId reserved for threads (v1 UI ignores it).
 */

const messageSchema = new Schema(
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
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // May be "" if the message is attachments-only — required in API (Zod), not
    // here: Mongoose treats "" as missing, which would reject attachments-only.
    body: {
      type: String,
      default: "",
      maxlength: 4000,
      trim: true,
    },
    attachments: {
      type: [messageAttachmentSchema],
      default: [],
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length <= 3,
        message: "At most 3 attachments per message",
      },
    },
    // Optional client id so retries don't create duplicates
    clientMessageId: {
      type: String,
      trim: true,
    },
    // Reserved — threads later; always null in v1 sends
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
)

// History: newest / older pages for one channel
messageSchema.index({ channelId: 1, createdAt: -1 })

// Idempotency when client sends clientMessageId
messageSchema.index(
  { channelId: 1, clientMessageId: 1 },
  { unique: true, sparse: true }
)

export type MessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: Types.ObjectId
}

let Message: Model<MessageDocument>

if (models.Message) {
  Message = models.Message as Model<MessageDocument>
} else {
  Message = model<MessageDocument>("Message", messageSchema)
}

export { Message }
