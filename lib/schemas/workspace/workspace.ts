import { z } from "zod"

/** Shared create-workspace rules — reuse later on POST /api/workspaces */
 const workSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
})

export default workSpaceSchema

export type WorkSpaceSchema = z.infer<typeof workSpaceSchema>
