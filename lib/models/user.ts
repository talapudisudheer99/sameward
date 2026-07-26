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
    // Email/password users have this. Google-only users do not (until forgot-password later).
    passwordHash: {
      type: String,
      required: function (this: { googleId?: string }) {
        return !this.googleId
      },
      select: false,
    },
    // Google's stable user id ("sub"). Sparse unique = only index docs that have it.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId
}

export const User: Model<UserDocument> =
  (models.User as Model<UserDocument>) ??
  model<UserDocument>("User", userSchema)
