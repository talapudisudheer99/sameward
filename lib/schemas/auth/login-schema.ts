import z from "zod"

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export default loginSchema
export type LoginSchema = z.infer<typeof loginSchema>
