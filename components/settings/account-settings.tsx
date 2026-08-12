"use client"

import { useState } from "react"
import { isAxiosError } from "axios"
import { CheckCircle2, MailWarning } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api/axios"
import { useCurrentUser } from "@/hooks/auth/use-current-user"

/**
 * Account email + verification status / resend.
 */
export default function AccountSettings() {
  const { user, emailVerified, isLoading } = useCurrentUser()
  const [sending, setSending] = useState(false)

  async function resend() {
    try {
      setSending(true)
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
      setSending(false)
    }
  }

  if (isLoading || !user) {
    return (
      <p className="text-sm text-muted-foreground">Loading account…</p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Email
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{user.email}</p>
      </div>

      {emailVerified ? (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          <span>Email verified</span>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-50/80 p-3 dark:bg-amber-950/30">
          <div className="flex items-start gap-2 text-sm text-amber-950 dark:text-amber-50">
            <MailWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Verify your email to unlock invites and other trusted features.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={sending}
            onClick={() => void resend()}
          >
            {sending ? "Sending…" : "Resend verification email"}
          </Button>
        </div>
      )}
    </div>
  )
}
