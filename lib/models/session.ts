import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
} from "@/lib/db/mongoose-ns"
import type { Types } from "mongoose"

/**
 * One document = one logged-in device/browser.
 * Logging out deletes the document, which instantly invalidates that cookie.
 */
const sessionSchema = new Schema(
  {
    // We never store the raw token. If the DB leaked, raw tokens would let an
    // attacker log in as anyone. We store its SHA-256 hash instead.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Which user this session belongs to. `ref` lets us .populate() later.
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // we query by userId (e.g. "log out everywhere")
    },
    // `expires: 0` makes this a TTL index: Mongo deletes the document
    // automatically once the current time passes expiresAt.
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true }
)

export type SessionDocument = InferSchemaType<typeof sessionSchema> & {
  _id: Types.ObjectId
}

export const Session: Model<SessionDocument> =
  (models.Session as Model<SessionDocument>) ??
  model<SessionDocument>("Session", sessionSchema)
