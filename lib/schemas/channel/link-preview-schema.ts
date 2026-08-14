import { z } from "zod"

/**
 * POST …/channels/:channelId/link-preview — composer live unfurl.
 */
export const linkPreviewRequestSchema = z.object({
  url: z.string().url().max(2000),
})
