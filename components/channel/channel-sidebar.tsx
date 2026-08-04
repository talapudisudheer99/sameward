"use client"

import Link from "next/link"
import { Hash, Lock, Plus } from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChannelListItem } from "@/lib/types/channel/channel-types"

type ChannelSidebarProps = {
  workspaceId: string
  channels: ChannelListItem[]
  activeChannelId?: string
  /** Owner | admin — show Create */
  canCreate: boolean
  onCreateClick: () => void
  className?: string
}

/**
 * Ch-A — channel list inside a workspace.
 * Wire: useGetChannelsQuery → channels; Link already points at chat route.
 */
export default function ChannelSidebar({
  workspaceId,
  channels,
  activeChannelId,
  canCreate,
  onCreateClick,
  className,
}: ChannelSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-56 shrink-0 flex-col border-r border-border bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <h2 className="font-heading text-sm font-semibold tracking-tight">
          Channels
        </h2>
        {canCreate ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="text-primary"
            onClick={onCreateClick}
            aria-label="Create channel"
          >
            <Plus className="size-4" />
          </Button>
        ) : null}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Channels">
        {channels.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            No channels yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {channels.map((ch) => {
              const active = ch.id === activeChannelId
              const Icon = ch.visibility === "private" ? Lock : Hash
              return (
                <li key={ch.id} className="min-w-0">
                  <Link
                    href={`/workspace/${workspaceId}/channels/${ch.id}`}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon
                      className="size-3.5 shrink-0 opacity-70"
                      aria-hidden
                    />
                    <OverflowText className="min-w-0 flex-1">
                      {ch.name}
                    </OverflowText>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      {canCreate ? (
        <p className="border-t border-border px-3 py-2 text-[11px] leading-snug text-muted-foreground">
          Create channels for topics your team discusses.
        </p>
      ) : null}
    </aside>
  )
}
