"use client"

import { WifiOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type ReconnectBannerProps = {
  visible: boolean
  onDismiss?: () => void
}

/** Shown while socket is disconnected (RTK/socket later). */
export default function ReconnectBanner({
  visible,
  onDismiss,
}: ReconnectBannerProps) {
  if (!visible) return null

  return (
    <div
      className="flex items-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-sm text-foreground"
      role="status"
    >
      <WifiOff className="size-4 shrink-0 text-primary" aria-hidden />
      <span className="flex-1">Reconnecting…</span>
      {onDismiss ? (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
