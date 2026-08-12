import { z } from "zod"

const linkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: z
    .string()
    .trim()
    .url()
    .max(500)
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "Links must start with http:// or https://",
    }),
})

/**
 * PATCH /api/auth/me — all fields optional; only provided keys update.
 * `avatarUrl: null` clears the avatar.
 */
const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).max(50).optional(),
    title: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(280).optional(),
    timezone: z.string().trim().max(64).optional(),
    links: z.array(linkSchema).max(2).optional(),
    avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  })
  .strict()

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
export default updateProfileSchema
