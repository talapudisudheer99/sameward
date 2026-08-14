"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { AuthShell } from "@/components/marketing/auth-shell"
import {
  AuthDivider,
  GoogleAuthButton,
} from "@/components/marketing/google-auth-button"
import { Form } from "@/components/ui/form"
import signupSchema, {
  type SignupSchema,
} from "@/lib/schemas/auth/signup-schema"

export default function SignUpPage() {
  // Client-side navigation after the API successfully creates the account.
  const router = useRouter()

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    setError,
    watch,
    trigger,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = form

  const password = watch("password")

  // Match refine lives on confirmPassword — re-check when password changes.
  useEffect(() => {
    if (getValues("confirmPassword").length > 0) {
      void trigger("confirmPassword")
    }
  }, [password, getValues, trigger])

  /**
   * React Hook Form calls this only after client-side Zod validation passes.
   * The server validates again because browser input can never be trusted.
   */
  const onSubmit = async (data: SignupSchema) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // Explicit for learning: allow the browser to accept/send auth cookies.
        // Same-origin fetch includes them by default, but this documents intent.
        credentials: "include",
      })

      // Our API always returns JSON, whether it succeeds or fails.
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        // A non-2xx response (400/409/500) is an expected API failure.
        const message = result.message ?? "Could not create your account"
        setError("root.serverError", {
          type: "server",
          message,
        })
        return
      }

      toast.success("Account created — welcome to TeamHub")
      // Signup created the user and session cookie; enter the protected app.
      router.replace("/workspace")
      router.refresh()
    } catch {
      // fetch throws for network failures, not for normal 4xx/5xx responses.
      const message = "Unable to reach the server. Please try again."
      setError("root.serverError", {
        type: "network",
        message,
      })
      return
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Join TeamHub AI and get started in minutes."
      panelTitle={
        <>
          Your work. <span className="text-primary">All together.</span>
        </>
      }
      panelDescription="Channels, docs, boards, and AI assistance in one calm place your team actually wants to use."
      footer={
        <>
          Already have an account?{" "}
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
            name="fullName"
            label="Full name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
          />
          <AppFormField
            control={control}
            name="email"
            label="Email address"
            type="email"
            placeholder="name@company.com"
          />
          <AppFormField
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
          />
          <AppFormField
            control={control}
            name="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
          />

          <p className="text-xs leading-relaxed text-muted-foreground">
            TeamHub is a learning product. Formal Terms of Service and Privacy
            Policy pages will be published later.
          </p>

          {errors.root?.serverError?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.serverError.message}
            </p>
          ) : null}

          <SubmitButton
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            text="Create account"
            className="h-11 w-full"
          />
        </form>
      </Form>

      <AuthDivider />
      <GoogleAuthButton />
    </AuthShell>
  )
}
