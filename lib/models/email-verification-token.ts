import { InferSchemaType, model, Model, models, Schema, Types } from "mongoose"

const emailVerificationTokenSchema = new Schema(
  {
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
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },

  { timestamps: true }
)

export type EmailVerificationTokenDocument = InferSchemaType<
  typeof emailVerificationTokenSchema
> & {
  _id: Types.ObjectId
}

let EmailVerificationToken: Model<EmailVerificationTokenDocument>

if (models.EmailVerificationToken) {
  EmailVerificationToken =
    models.EmailVerificationToken as Model<EmailVerificationTokenDocument>
} else {
  EmailVerificationToken = model<EmailVerificationTokenDocument>(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  )
}

export { EmailVerificationToken }
