import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

const authEventSchema = new Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ip: {
      type: String,
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
)

authEventSchema.index({ createdAt: -1 })

export type AuthEventDocument = InferSchemaType<typeof authEventSchema> & {
  _id: Types.ObjectId
}

let AuthEvent: Model<AuthEventDocument>

if (models.AuthEvent) {
  AuthEvent = models.AuthEvent as Model<AuthEventDocument>
} else {
  AuthEvent = model<AuthEventDocument>("AuthEvent", authEventSchema)
}

export { AuthEvent }
