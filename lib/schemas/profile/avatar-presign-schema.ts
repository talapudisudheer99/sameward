import { z } from "zod"

/** Single avatar image for POST /api/auth/me/avatar */
const avatarPresignSchema = z.object({
  name: z.string().trim().min(1).max(200),
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive().max(2 * 1024 * 1024),
})

export type AvatarPresignSchema = z.infer<typeof avatarPresignSchema>
export default avatarPresignSchema
