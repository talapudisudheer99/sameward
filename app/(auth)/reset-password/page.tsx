"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { AuthShell } from "@/components/marketing/auth-shell"
import { Form } from "@/components/ui/form"
import { api } from "@/lib/api/axios"
import resetPasswordSchema, {
  type ResetPasswordSchema,
} from "@/lib/schemas/auth/reset-password-schema"

export default function ResetPasswordPage() {
  const router = useRouter()

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: "",
    },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = form

  // Read ?token= from the email link (same pattern as login ?error=)
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")

    if (!token) {
      toast.error("Reset link is missing or invalid")
      router.replace("/forgot-password")
      return
    }

    setValue("token", token, { shouldValidate: true })
  }, [router, setValue])

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await api.post("/api/auth/reset-password", data)

      toast.success("Password reset successfully")
      router.replace("/login")
      router.refresh()
    } catch (error) {
      let message

      if (isAxiosError(error)) {
        message = error.response?.data?.message ?? "Something went wrong"
      } else {
        message = "Unable to reach the server. Please try again."
      }

      setError("root.serverError", { type: "server", message })
      toast.error(message)
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong password for your TeamHub account."
      panelTitle={
        <>
          Almost there. <span className="text-primary">One more step.</span>
        </>
      }
      panelDescription="After this you can log in with email and password — including if you first joined with Google."
      footer={
        <>
          Back to{" "}
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
            name="password"
            label="New password"
            type="password"
            placeholder="Enter your new password"
            autoComplete="new-password"
          />

          <AppFormField
            control={control}
            name="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Confirm your new password"
            autoComplete="new-password"
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
            text="Reset password"
            className="h-11 w-full"
          />
        </form>
      </Form>
    </AuthShell>
  )
}
