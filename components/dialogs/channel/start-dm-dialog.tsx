"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import CancelButton from "@/components/buttons/cancel-button"
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
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"
import { cn } from "@/lib/utils"

type StartDmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidates: WorkspaceMemberOption[]
  onSelect: (userId: string) => Promise<void>
  isSubmitting?: boolean
}

/**
 * Pick a workspace member to open (or resume) a 1:1 DM.
 */
export default function StartDmDialog({
  open,
  onOpenChange,
  candidates,
  onSelect,
  isSubmitting = false,
}: StartDmDialogProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

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
      setSelected(null)
    }
    onOpenChange(next)
  }

  async function handleSubmit() {
    if (!selected) return
    try {
      await onSelect(selected)
      handleOpenChange(false)
    } catch {
      // Parent toasts; keep dialog open for retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New direct message</DialogTitle>
          <DialogDescription>
            Choose a teammate to message privately.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="pl-8"
            autoFocus
          />
        </div>

        <ul className="max-h-56 overflow-y-auto rounded-md border border-border">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No teammates found.
            </li>
          ) : (
            filtered.map((m) => {
              const active = selected === m.userId
              return (
                <li key={m.userId}>
                  <button
                    type="button"
                    onClick={() => setSelected(m.userId)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors",
                      active ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">{m.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <DialogFooter className="gap-2">
          <CancelButton
            onClick={() => handleOpenChange(false)}
            className="h-9 min-w-24"
          />
          <Button
            type="button"
            disabled={!selected || isSubmitting}
            onClick={() => void handleSubmit()}
            className="btn-brand-gradient h-9 min-w-24"
          >
            {isSubmitting ? "Opening…" : "Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
