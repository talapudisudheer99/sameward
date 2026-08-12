import { z } from "zod"

/**
 * Create channel body — name + visibility.
 */
const channelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Channel name must be at least 2 characters" })
    .max(80, { message: "Channel name must be less than 80 characters" }),
  visibility: z.enum(["public", "private"], {
    message: "Visibility must be public or private",
  }),
})

/** PATCH rename — name only (visibility change deferred). */
export const renameChannelSchema = channelSchema.pick({ name: true })

export default channelSchema
export type ChannelSchema = z.infer<typeof channelSchema>
export type RenameChannelSchema = z.infer<typeof renameChannelSchema>
