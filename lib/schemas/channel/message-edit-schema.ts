import { z } from "zod"

/**
 * PATCH …/messages/:messageId — edit body only (attachments stay as-is).
 */
const messageEditSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: "Message body is required" })
    .max(4000, { message: "Message must be 4000 characters or less" }),
})

export default messageEditSchema
export type MessageEditSchema = z.infer<typeof messageEditSchema>
