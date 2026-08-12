import { z } from "zod"

import { isCatalogEmoji } from "@/lib/channels/emoji-catalog"

/**
 * POST …/messages/:messageId/reactions — toggle one catalog emoji.
 */
const messageReactionSchema = z.object({
  emoji: z
    .string()
    .min(1)
    .max(16)
    .refine((v) => isCatalogEmoji(v), { message: "Emoji not allowed" }),
})

export default messageReactionSchema
export type MessageReactionSchema = z.infer<typeof messageReactionSchema>
