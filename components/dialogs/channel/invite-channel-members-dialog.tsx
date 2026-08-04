"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import CancelButton from "@/components/buttons/cancel-button"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InviteChannelMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelName: string
  /** Workspace members not already in this private channel (filter in parent / RTK) */
  candidates: WorkspaceMemberOption[]
  onInvite: (userIds: string[]) => Promise<void>
  isSubmitting?: boolean
}

/**
 * Ch-F — Add people to a private channel (workspace members only).
 * Wire: candidates from GET workspace members − channel members;
 * onInvite → useAddChannelMembersMutation.
 */
export default function InviteChannelMembersDialog({
  open,
  onOpenChange,
  channelName,
  candidates,
  onInvite,
  isSubmitting = false,
}: InviteChannelMembersDialogProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    )
  }, [candidates, query])

  function handleOpenChange(next: boolean) {
    if (!next) {
      setQuery("")
      setSelected(new Set())
    }
    onOpenChange(next)
  }

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function handleSubmit() {
    const ids = [...selected]
    if (ids.length === 0) return
    await onInvite(ids)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-4 p-5 sm:max-w-md">
        <DialogHeader className="gap-1.5 pr-8 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
            Add people to #{channelName}
          </DialogTitle>
          <DialogDescription>Only workspace members</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members"
            className="h-10 pl-9"
          />
        </div>

        <ul className="max-h-56 space-y-1 overflow-y-auto rounded-[var(--radius)] border border-border p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matching members
            </li>
          ) : (
            filtered.map((m) => {
              const checked = selected.has(m.userId)
              return (
                <li key={m.userId}>
                  <button
                    type="button"
                    onClick={() => toggle(m.userId)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                      checked && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border border-border",
                        checked &&
                          "border-primary bg-primary text-primary-foreground"
                      )}
                      aria-hidden
                    >
                      {checked ? "✓" : null}
                    </span>
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                      aria-hidden
                    >
                      {m.fullName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {m.fullName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {m.email}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <DialogFooter className="gap-2 sm:justify-end">
          <CancelButton
            onClick={() => handleOpenChange(false)}
            className="h-9 min-w-24"
          />
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={selected.size === 0 || isSubmitting}
            className="h-9 min-w-24"
          >
            {isSubmitting ? "Please wait…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
