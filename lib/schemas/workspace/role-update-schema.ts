import { z } from "zod"

/**
 * PATCH role body — promote/demote between member and admin only.
 * Owner is not assignable via this endpoint.
 */
const roleUpdateSchema = z.object({
  role: z.enum(["member", "admin"], {
    message: "Role must be member or admin",
  }),
})

export default roleUpdateSchema
export type RoleUpdateSchema = z.infer<typeof roleUpdateSchema>
