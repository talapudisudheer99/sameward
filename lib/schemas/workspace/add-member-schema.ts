import { z } from "zod"

/**
 * POST /api/workspaces/[workspaceId]/members body (v1).
 * Multi-email chips → one submit → { emails: string[] }
 */
const addMemberSchema = z.object({
  emails: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .email({ message: "Enter a valid email address" })
    )
    .min(1, { message: "Add at least one email" })
    // Dedupe after normalize so Alex@X.com and alex@x.com count once
    .transform((emails) => [...new Set(emails)]),
})

export default addMemberSchema
export type AddMemberSchema = z.infer<typeof addMemberSchema>
