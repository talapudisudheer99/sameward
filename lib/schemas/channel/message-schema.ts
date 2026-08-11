import { z } from "zod"

import {
  ALLOWED_ATTACHMENT_MIMES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/channels/attachment-limits"

/**
 * One attachment metadata object (bytes live in S3).
 */
export const attachmentSchema = z.object({
  url: z.string().url({ message: "Invalid attachment URL" }),
  name: z.string().trim().min(1, { message: "Attachment name is required" }),
  mime: z.enum(ALLOWED_ATTACHMENT_MIMES, { message: "File type not allowed" }),
  sizeBytes: z
    .number()
    .int({ message: "sizeBytes must be an integer" })
    .min(1, { message: "Attachment cannot be empty" })
    .max(MAX_ATTACHMENT_BYTES, {
      message: "Attachment size must be 10MB or less",
    }),
})

/**
 * POST message body — text and/or attachments (max 3).
 * No parentMessageId from client in v1.
 */
const messageSchema = z
  .object({
    body: z
      .string()
      .trim()
      .max(4000, { message: "Message must be 4000 characters or less" })
      .default(""),
    attachments: z
      .array(attachmentSchema)
      .max(MAX_ATTACHMENTS_PER_MESSAGE, {
        message: `At most ${MAX_ATTACHMENTS_PER_MESSAGE} attachments per message`,
      })
      .default([]),
    mentionedUserIds: z
      .array(
        z
          .string()
          .regex(/^[a-f\d]{24}$/i, { message: "Invalid mentioned user id" })
      )
      .max(20, { message: "At most 20 mentions per message" })
      .default([]),
    clientMessageId: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.body.length > 0 || data.attachments.length > 0, {
    message: "Message must have either body or attachments",
  })

export default messageSchema
export type MessageSchema = z.infer<typeof messageSchema>
