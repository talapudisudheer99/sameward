import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose"

import type { AiKind } from "@/lib/ai/constants"

/**
 * Optional audit row for cost / debugging — not shown in the product UI.
 */
const aiRunSchema = new Schema(
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
    kind: {
      type: String,
      required: true,
      enum: [
        "summarize",
        "catch-up",
        "ask",
        "explain",
        "draft-reply",
        "notes",
      ] satisfies AiKind[],
    },
    messageCount: { type: Number, required: true, min: 0 },
    model: { type: String, required: true },
    promptTokens: { type: Number },
    completionTokens: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

aiRunSchema.index({ userId: 1, createdAt: -1 })

export type AiRunDocument = InferSchemaType<typeof aiRunSchema> & {
  _id: Types.ObjectId
}

let AiRun: Model<AiRunDocument>

if (models.AiRun) {
  AiRun = models.AiRun as Model<AiRunDocument>
} else {
  AiRun = model<AiRunDocument>("AiRun", aiRunSchema)
}

export { AiRun }
