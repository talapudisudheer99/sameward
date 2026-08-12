"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { isAxiosError } from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api/axios"
import { useCurrentUser } from "@/hooks/auth/use-current-user"

/**
 * Change password (password accounts) or tip for Google-only users.
 */
export default function PasswordSettings() {
  const { user, isLoading } = useCurrentUser()
  const hasPassword = user?.hasPassword === true

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const { data } = await api.post<{ message?: string }>(
        "/api/auth/change-password",
        { currentPassword, newPassword, confirmPassword }
      )
      toast.success(data.message ?? "Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      let message = "Could not update password"
      if (isAxiosError(error)) {
        message = error.response?.data?.message ?? message
      }
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <p className="text-sm text-muted-foreground">Loading…</p>
    )
  }

  if (!hasPassword) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          You signed in with Google and don’t have a password yet. Use forgot
          password with your email to set one, then you can change it here.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Set a password
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <p className="text-[11px] text-muted-foreground">
          At least 8 characters, with upper, lower, number, and special
          character.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="btn-brand-gradient"
      >
        {saving ? "Updating…" : "Update password"}
      </Button>
    </form>
  )
}
