import { z } from "zod"

/** POST …/dms — open or create a 1:1 DM with a workspace member */
export const openDmSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, { message: "userId is required" })
    .regex(/^[a-f\d]{24}$/i, { message: "Invalid userId" }),
})

export type OpenDmSchema = z.infer<typeof openDmSchema>
