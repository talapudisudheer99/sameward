"use client"

import { UserPlus } from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChannelMemberRow } from "@/lib/types/channel/channel-types"

type ChannelMembersPanelProps = {
  members: ChannelMemberRow[]
  canInvite: boolean
  onInvite: () => void
  /** Wire: useRemoveChannelMemberMutation + confirm */
  onRemove?: (userId: string) => void
  /** Profile v1 — open teammate card */
  onOpenProfile?: (member: ChannelMemberRow) => void
  className?: string
}

/**
 * Ch-E — private channel members side panel.
 */
export default function ChannelMembersPanel({
  members,
  canInvite,
  onInvite,
  onRemove,
  onOpenProfile,
  className,
}: ChannelMembersPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[min(100%,14rem)] shrink-0 flex-col border-l border-border bg-card shadow-xl",
        // Overlay on tablet/phone; docked from lg up
        "absolute inset-y-0 right-0 z-30 lg:static lg:w-56 lg:shadow-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <h2 className="font-heading text-sm font-semibold">Members</h2>
        {canInvite ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onInvite}
            aria-label="Add people"
          >
            <UserPlus className="size-4 text-primary" />
          </Button>
        ) : null}
      </div>

      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        {members.map((m) => (
          <li
            key={m.userId}
            className="flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-2 py-1.5"
          >
            <button
              type="button"
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none",
                onOpenProfile &&
                  "hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
              )}
              onClick={() => onOpenProfile?.(m)}
              disabled={!onOpenProfile}
            >
              <span className="relative shrink-0">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {m.fullName.slice(0, 1).toUpperCase()}
                </span>
                {m.online ? (
                  <span
                    className="absolute right-0 bottom-0 size-2 rounded-full border border-card bg-primary"
                    title="Online"
                  />
                ) : null}
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <OverflowText className="block text-sm font-medium">
                  {m.fullName}
                </OverflowText>
              </div>
            </button>
            {onRemove ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                className="shrink-0 text-xs text-muted-foreground"
                onClick={() => onRemove(m.userId)}
              >
                Remove
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  )
}
