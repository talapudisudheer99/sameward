import { z } from "zod"

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const

/**
 * One attachment metadata object (bytes live in S3).
 */
export const attachmentSchema = z.object({
  url: z.string().url({ message: "Invalid attachment URL" }),
  name: z.string().trim().min(1, { message: "Attachment name is required" }),
  mime: z.enum(ALLOWED_MIMES, { message: "File type not allowed" }),
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
      .max(3, { message: "At most 3 attachments per message" })
      .default([]),
    clientMessageId: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.body.length > 0 || data.attachments.length > 0, {
    message: "Message must have either body or attachments",
  })

export default messageSchema
export type MessageSchema = z.infer<typeof messageSchema>
