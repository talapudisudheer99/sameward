import { z } from "zod"

/**
 * POST …/channels/[channelId]/members
 * Add existing workspace members to a private channel (not email invites).
 */
const channelMembersSchema = z.object({
  userIds: z
    .array(z.string().trim().min(1, { message: "userId cannot be empty" }))
    .min(1, { message: "At least one user is required" })
    .transform((userIds) => [...new Set(userIds)]),
})

export default channelMembersSchema
export type ChannelMembersSchema = z.infer<typeof channelMembersSchema>
