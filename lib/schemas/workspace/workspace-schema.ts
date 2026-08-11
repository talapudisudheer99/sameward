import { z } from "zod"

/**
 * Shared create / edit workspace rules.
 * `description` is always a string in the form (often ""); never required for product meaning.
 */
const workSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  description: z
    .string()
    .trim()
    .max(280, { message: "Description must be 280 characters or less" }),
})

export default workSpaceSchema

export type WorkSpaceSchema = z.infer<typeof workSpaceSchema>
