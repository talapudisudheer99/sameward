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
    /** @mentions — validated against workspace/channel members in the API */
    mentionedUserIds: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length <= 20,
        message: "At most 20 mentions per message",
      },
    },
    /** Set when the author edits the body (null = never edited) */
    editedAt: {
      type: Date,
      default: null,
    },
    /** Soft delete — tombstone keeps the row for transcript continuity */
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    /**
     * Emoji reactions — one entry per emoji, userIds who reacted.
     * Toggle via POST …/reactions (no custom emoji packs).
     */
    reactions: {
      type: [
        {
          emoji: { type: String, required: true, trim: true, maxlength: 8 },
          userIds: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            default: [],
          },
        },
      ],
      default: [],
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length <= 20,
        message: "At most 20 reaction types per message",
      },
    },
    /**
     * Open Graph / link unfurl cards — filled on send/edit (SSRF-safe fetch).
     * Empty when body has no public http(s) URLs or fetch failed.
     */
    linkPreviews: {
      type: [
        {
          url: { type: String, required: true },
          finalUrl: { type: String, required: true },
          title: { type: String, required: true, maxlength: 200 },
          description: { type: String, default: null, maxlength: 280 },
          imageUrl: { type: String, default: null },
          siteName: { type: String, default: null, maxlength: 120 },
          faviconUrl: { type: String, default: null },
        },
      ],
      default: [],
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length <= 2,
        message: "At most 2 link previews per message",
      },
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
