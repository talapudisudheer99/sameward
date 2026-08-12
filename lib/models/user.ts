import {
  Schema,
  models,
  model,
  type InferSchemaType,
  type Model,
} from "@/lib/db/mongoose-ns"
import type { Types } from "mongoose"

const profileLinkSchema = new Schema(
  {
    label: { type: String, trim: true, maxlength: 40, required: true },
    url: { type: String, trim: true, maxlength: 500, required: true },
  },
  { _id: false }
)

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function (this: { googleId?: string }) {
        return !this.googleId
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    /** Profile v1 — optional professional card fields */
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: 64,
      default: "",
    },
    links: {
      type: [profileLinkSchema],
      default: [],
      validate: {
        validator: (v: unknown[]) => !Array.isArray(v) || v.length <= 2,
        message: "At most 2 links",
      },
    },
  },
  {
    timestamps: true,
  }
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId
}

// Next.js hot-reload keeps an old Model in `models.User` without new fields.
// That silently strips new fields on create/update. Clear it in dev.
if (process.env.NODE_ENV !== "production" && models.User) {
  delete models.User
}

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ??
  model<UserDocument>("User", userSchema)
