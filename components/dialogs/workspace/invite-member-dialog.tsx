"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

import CancelButton from "@/components/buttons/cancel-button"
import SubmitButton from "@/components/buttons/submit-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { cn } from "@/lib/utils"
import { useInviteWorkspaceMembersMutation } from "@/store/api/workspace/workspaces-api"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

function splitEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map(normalizeEmail)
    .filter(Boolean)
}

function failureLabel(reason: string): string {
  if (reason === "not_found") return "not on Sameward"
  if (reason === "already_member") return "already a member"
  if (reason === "invite_failed") return "couldn’t create invite"
  if (reason === "email_send_failed")
    return "email provider blocked send (Resend test mode?)"
  return reason
}

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
}

/**
 * Chip input → POST invites (membership only after accept).
 */
export default function InviteMemberDialog({
  open,
  onOpenChange,
  workspaceId,
}: InviteMemberDialogProps) {
  const { emailVerified, isLoading: userLoading } = useCurrentUser()
  const [inviteMembers, { isLoading }] = useInviteWorkspaceMembersMutation()
  const [emails, setEmails] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setEmails([])
      setDraft("")
      setError(null)
    }
    onOpenChange(next)
  }

  function addFromRaw(raw: string) {
    const next = splitEmails(raw)
    if (next.length === 0) return

    const invalid = next.find((e) => !EMAIL_RE.test(e))
    if (invalid) {
      setError(`Invalid email: ${invalid}`)
      return
    }

    setEmails((prev) => [...new Set([...prev, ...next])])
    setDraft("")
    setError(null)
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email))
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault()
      if (draft.trim()) addFromRaw(draft)
      return
    }
    if (e.key === "Backspace" && !draft && emails.length > 0) {
      removeEmail(emails.at(-1)!)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!emailVerified) {
      toast.error("Verify your email to invite teammates")
      return
    }

    let next = [...emails]
    if (draft.trim()) {
      const pieces = splitEmails(draft)
      const invalid = pieces.find((em) => !EMAIL_RE.test(em))
      if (invalid) {
        setError(`Invalid email: ${invalid}`)
        return
      }
      next = [...new Set([...next, ...pieces])]
    }

    if (next.length === 0) {
      setError("Add at least one email")
      return
    }

    setError(null)

    try {
      const { invited, failed } = await inviteMembers({
        workspaceId,
        emails: next,
      }).unwrap()

      if (invited.length > 0) {
        toast.success(
          invited.length === 1
            ? `Invite sent to ${invited[0]!.email}`
            : `Invites sent to ${invited.length} people`
        )
      }

      if (failed.length > 0) {
        toast.error("Some invites couldn’t be sent", {
          description: failed
            .map((f) => `${f.email} (${failureLabel(f.reason)})`)
            .join(" · "),
        })
      }

      if (invited.length > 0 && failed.length === 0) {
        handleOpenChange(false)
      } else if (invited.length > 0) {
        const failedSet = new Set(failed.map((f) => f.email))
        setEmails(next.filter((em) => failedSet.has(em)))
        setDraft("")
      }
    } catch (err: unknown) {
      console.error(err)
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? (err as { status?: number }).status
          : undefined
      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { message?: string } }).data?.message ===
          "string"
          ? (err as { data: { message: string } }).data.message
          : "Check your connection and try again."

      toast.error(
        status === 403 ? "Can’t send invites" : "Couldn’t send invites",
        { description: message }
      )
    }
  }

  const busy = isLoading || userLoading
  const canSubmit =
    emailVerified && (emails.length > 0 || draft.trim().length > 0) && !busy

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        <DialogHeader className="gap-1.5 pr-8 text-left">
          <DialogTitle className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            Send invite
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Enter emails of people who already have a Sameward account. They’ll
            get a link to accept before joining.
          </DialogDescription>
        </DialogHeader>

        {!emailVerified && !userLoading ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-50">
            Verify your email before inviting teammates.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label
              htmlFor="member-emails"
              className="block text-sm font-medium leading-none text-foreground"
            >
              Email addresses
            </label>

            <div
              className={cn(
                "flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 transition-colors",
                "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
                error && "border-destructive ring-3 ring-destructive/20"
              )}
            >
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex max-w-full items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="rounded p-0.5 hover:bg-primary/15"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="size-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}

              <input
                id="member-emails"
                type="text"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  if (error) setError(null)
                }}
                onKeyDown={onKeyDown}
                onBlur={() => {
                  if (draft.trim()) addFromRaw(draft)
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text")
                  if (/[,;\s]/.test(text)) {
                    e.preventDefault()
                    addFromRaw(text)
                  }
                }}
                placeholder={
                  emails.length === 0 ? "name@example.com" : "Add another…"
                }
                className="min-w-32 flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                autoComplete="off"
                disabled={busy || !emailVerified}
              />
            </div>

            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Paste multiple emails separated by commas if you like.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <CancelButton
              onClick={() => handleOpenChange(false)}
              className="h-9"
            />
            <SubmitButton
              type="submit"
              disabled={!canSubmit}
              isLoading={isLoading}
              text="Send invite"
              className="h-9 min-w-28"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
