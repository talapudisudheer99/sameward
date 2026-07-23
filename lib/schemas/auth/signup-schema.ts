import z from "zod"

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Enter your full name" })
      .max(50, { message: "Full name must be less than 50 characters" })
      .trim(),
      email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(72, { message: "Password must be less than 50 characters" }).regex(/[A-Z]/,{message:"Password must contain at least one uppercase letter"}) .regex(/[a-z]/, {
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default signupSchema
export type SignupSchema = z.infer<typeof signupSchema>
