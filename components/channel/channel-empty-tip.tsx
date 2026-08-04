"use client"

import { Hash } from "lucide-react"

import { Button } from "@/components/ui/button"

type ChannelEmptyTipProps = {
  canCreate: boolean
  onCreateClick: () => void
}

/**
 * Ch-B — rare empty tip (API normally ensures #general).
 */
export default function ChannelEmptyTip({
  canCreate,
  onCreateClick,
}: ChannelEmptyTipProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-[var(--radius)] border border-border bg-muted text-muted-foreground"
        aria-hidden
      >
        <Hash className="size-6" strokeWidth={1.5} />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          No channels yet
        </h2>
        <p className="text-sm text-muted-foreground">
          {canCreate
            ? "Create a channel so your team has a place to talk."
            : "Ask an owner or admin to create the first channel."}
        </p>
      </div>
      {canCreate ? (
        <Button type="button" onClick={onCreateClick}>
          Create channel
        </Button>
      ) : null}
    </div>
  )
}
