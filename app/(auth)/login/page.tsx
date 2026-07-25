"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
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
import { api } from "@/lib/api/axios"
import loginSchema, {
  type LoginSchema,
} from "@/lib/schemas/auth/login-schema"

export default function LoginPage() {
  const router = useRouter()

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = form

  // axios throws on 4xx/5xx — unlike fetch, which only fails on network errors
  const onSubmit = async (data: LoginSchema) => {
    try {
      await api.post("/api/auth/signin", data)

      toast.success("Welcome back")
      router.replace("/workspace")
      router.refresh()
    } catch (error) {
      let message

      if (isAxiosError(error)) {
        message = error.response?.data?.message ?? "Invalid email or password"
      } else {
        message = "Unable to reach the server. Please try again."
      }

      setError("root.serverError", { type: "server", message })
      toast.error(message)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your TeamHub AI workspace."
      panelTitle={
        <>
          Your work. <span className="text-primary">All together.</span>
        </>
      }
      panelDescription="Channels, docs, boards, and AI assistance in one calm place your team actually wants to use."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
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
          <AppFormField
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => toast.message("Forgot password — coming soon")}
            >
              Forgot password?
            </button>
          </div>

          {errors.root?.serverError?.message ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.serverError.message}
            </p>
          ) : null}

          <SubmitButton
            type="submit"
            disabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
            text="Log in"
            className="h-11 w-full"
          />
        </form>
      </Form>

      <AuthDivider />
      <GoogleAuthButton />
    </AuthShell>
  )
}
