import z from "zod"

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Enter a valid email address" }),
})

export default forgotPasswordSchema
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
