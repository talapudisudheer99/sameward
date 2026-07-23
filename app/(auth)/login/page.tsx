"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import SubmitButton from "@/components/buttons/submit-button"
import { AppFormField } from "@/components/forms/app-form-field"
import { AuthShell } from "@/components/marketing/auth-shell"
import {
  AuthDivider,
  GoogleAuthButton,
} from "@/components/marketing/google-auth-button"
import { Form } from "@/components/ui/form"
import loginSchema, {
  type LoginSchema,
} from "@/lib/schemas/auth/login-schema"

export default function LoginPage() {
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
    formState: { isValid },
  } = form

  const onSubmit = (data: LoginSchema) => {
    console.log({
      action: "login",
      next: "POST /api/auth/login (Phase 2)",
      email: data.email,
      password: "[redacted]",
    })
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your TeamHub AI workspace."
      panelTitle={
        <>
          Your work.{" "}
          <span className="text-primary">All together.</span>
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
              onClick={() => console.log("forgot-password:coming-soon")}
            >
              Forgot password?
            </button>
          </div>

          <SubmitButton
            type="submit"
            disabled={!isValid}
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
