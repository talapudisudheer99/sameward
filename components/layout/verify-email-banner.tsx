"use client"

import { useState } from "react"
import { isAxiosError } from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/axios"

/** Soft-gate banner — app still usable underneath */
export default function VerifyEmailBanner() {
  const [isLoading, setIsLoading] = useState(false)

  const handleResend = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.post<{ message?: string }>(
        "/api/auth/resend-verification"
      )
      toast.success(data.message ?? "Verification email sent")
    } catch (error) {
      let message = "Failed to resend verification email"
      if (isAxiosError(error)) {
        message = error.response?.data?.message ?? message
      }
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
      <p>
        Please verify your email to unlock invites and other trusted features.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={handleResend}
      >
        {isLoading ? "Sending…" : "Resend verification email"}
      </Button>
    </div>
  )
}
