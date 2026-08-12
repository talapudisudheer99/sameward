"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"

import CancelButton from "@/components/buttons/cancel-button"
import Loader from "@/components/sharable/loader"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dialog heading */
  title: string
  /** Body copy — string or rich nodes (e.g. bold name) */
  description: React.ReactNode
  /** Confirm button label */
  confirmLabel?: string
  /** Shown while onConfirm is in flight */
  loadingLabel?: string
  cancelLabel?: string
  /** Optional Lucide icon in the header tile */
  icon?: LucideIcon
  /**
   * Visual tone for icon + confirm button.
   * destructive = leave / remove / delete
   */
  variant?: "destructive" | "default"
  /**
   * Called when user confirms. May be async.
   * Resolve → dialog closes. Throw/reject → stays open (toast in caller).
   */
  onConfirm: () => void | Promise<void>
  /** Disable confirm (e.g. type-to-confirm not matched yet) */
  confirmDisabled?: boolean
  className?: string
}

/**
 * Reusable confirm / danger dialog.
 * Pass title, description, and onConfirm — reuse for leave, remove, delete, etc.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  loadingLabel = "Please wait…",
  cancelLabel = "Cancel",
  icon: Icon,
  variant = "default",
  onConfirm,
  confirmDisabled = false,
  className,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const isDestructive = variant === "destructive"

  async function handleConfirm() {
    if (isConfirming || confirmDisabled) return

    setIsConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Caller handles toast / errors — keep dialog open
    } finally {
      setIsConfirming(false)
    }
  }

  function handleOpenChange(next: boolean) {
    // Don't dismiss while request is in flight
    if (isConfirming) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("gap-5 p-5 sm:max-w-md", className)}
        showCloseButton={!isConfirming}
      >
        <DialogHeader className="gap-3 pr-8 text-left">
          {Icon ? (
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl border",
                isDestructive
                  ? "border-border bg-destructive/10 text-destructive"
                  : "border-border bg-primary/10 text-primary"
              )}
              aria-hidden
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <CancelButton
            text={cancelLabel}
            className="h-9"
            onClick={() => handleOpenChange(false)}
          />
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            className="h-9 gap-2"
            disabled={isConfirming || confirmDisabled}
            onClick={handleConfirm}
          >
            {isConfirming ? <Loader className="size-4" /> : null}
            {isConfirming ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
