import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const passwordResetTokenSchema = new Schema(
  {
    // Store hash only — same idea as sessions
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Mongo TTL cleaner deletes expired docs
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  { timestamps: true }
)

export type PasswordResetTokenDocument = InferSchemaType<
  typeof passwordResetTokenSchema
> & {
  _id: Types.ObjectId
}

let PasswordResetToken: Model<PasswordResetTokenDocument>

// Hot reload can re-run this file — reuse the model if it already exists.
if (models.PasswordResetToken) {
  PasswordResetToken =
    models.PasswordResetToken as Model<PasswordResetTokenDocument>
} else {
  PasswordResetToken = model<PasswordResetTokenDocument>(
    "PasswordResetToken",
    passwordResetTokenSchema
  )
}

export { PasswordResetToken }
