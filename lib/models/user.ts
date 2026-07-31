import {
  Schema,
  models,
  model,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

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
  },
  {
    timestamps: true,
  }
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId
}

// Next.js hot-reload keeps an old Model in `models.User` without new fields.
// That silently strips `emailVerified` on create/update. Clear it in dev.
if (process.env.NODE_ENV !== "production" && models.User) {
  delete models.User
}

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ??
  model<UserDocument>("User", userSchema)
