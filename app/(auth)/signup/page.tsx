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
import signupSchema, {
  type SignupSchema,
} from "@/lib/schemas/auth/signup-schema"

export default function SignUpPage() {
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
    formState: { isValid },
  } = form

  const onSubmit = (data: SignupSchema) => {
    console.log({
      action: "signup",
      next: "POST /api/auth/signup (Phase 2)",
      ...data,
      password: "[redacted]",
      confirmPassword: "[redacted]",
    })
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
            By creating an account you agree to our{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => console.log("terms:coming-soon")}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => console.log("privacy:coming-soon")}
            >
              Privacy Policy
            </button>
            .
          </p>

          <SubmitButton
            type="submit"
            disabled={!isValid}
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
