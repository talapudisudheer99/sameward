"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { AuthShell } from "@/components/marketing/auth-shell"
import { Form } from "@/components/ui/form"
import forgotPasswordSchema, {
  type ForgotPasswordSchema,
} from "@/lib/schemas/auth/forgot-password-schema"

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = form

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      // Typo fix: forgot-password (not fogot-password)
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })

      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        const message = result.message ?? "Could not send reset password link"
        setError("root.serverError", {
          type: "server",
          message,
        })
        return
      }

      toast.success(result.message ?? "Reset password link sent")
    } catch {
      const message = "Unable to reach the server. Please try again."
      setError("root.serverError", {
        type: "network",
        message,
      })
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      description="Enter your email and we will send a reset link if an account exists."
      panelTitle={
        <>
          Reset safely. <span className="text-primary">Stay in control.</span>
        </>
      }
      panelDescription="We email a one-time link so only you can set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AppFormField
            control={control}
            name="email"
            label="Email address"
            type="email"
            placeholder="name@company.com"
          />

          {errors.root?.serverError?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.serverError.message}
            </p>
          ) : null}

          <SubmitButton
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            text="Send reset link"
            className="h-11 w-full"
          />
        </form>
      </Form>
    </AuthShell>
  )
}
