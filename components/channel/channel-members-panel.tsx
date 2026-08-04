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
  className,
}: ChannelMembersPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-56 shrink-0 flex-col border-l border-border bg-card",
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
