import z from "zod"

/** Same strength rules as reset-password; requires current password. */
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(72, { message: "Password must be at most 72 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must include at least one special character",
      }),
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  })

export default changePasswordSchema
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
