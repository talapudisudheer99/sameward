"use client"

import Link from "next/link"
import { Hash, Lock, MessageSquare, Plus } from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  ChannelListItem,
  DmListItem,
} from "@/lib/types/channel/channel-types"

type ChannelSidebarProps = {
  workspaceId: string
  channels: ChannelListItem[]
  dms?: DmListItem[]
  activeChannelId?: string
  /** Owner | admin — show Create channel */
  canCreate: boolean
  onCreateClick: () => void
  onNewDmClick?: () => void
  /**
   * When set (e.g. Explore demo), navigate in-place instead of real workspace URLs.
   */
  onSelectChannel?: (channelId: string) => void
  className?: string
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  const badge = count > 99 ? "99+" : String(count)
  return (
    <span className="ml-auto shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums">
      {badge}
    </span>
  )
}

/**
 * Channel list + Direct messages inside a workspace.
 */
export default function ChannelSidebar({
  workspaceId,
  channels,
  dms = [],
  activeChannelId,
  canCreate,
  onCreateClick,
  onNewDmClick,
  onSelectChannel,
  className,
}: ChannelSidebarProps) {
  function rowClass(active: boolean, unread: boolean) {
    return cn(
      "flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-2 py-1.5 text-sm transition-colors",
      active
        ? "bg-primary/10 font-medium text-primary"
        : unread
          ? "font-semibold text-foreground hover:bg-muted"
          : "text-foreground hover:bg-muted"
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col border-r border-border bg-card",
        activeChannelId
          ? "hidden w-44 md:flex md:w-56"
          : onSelectChannel
            ? "flex w-full md:w-56"
            : "flex w-44 md:w-56",
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

      <nav
        className="min-h-0 flex-1 overflow-y-auto p-2"
        aria-label="Channels"
        data-explore-tutorial="channels-list"
      >
        {channels.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted-foreground">
            No channels yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {channels.map((ch) => {
              const active = ch.id === activeChannelId
              const Icon = ch.visibility === "private" ? Lock : Hash
              const unread = !active && (ch.unreadCount ?? 0) > 0
              const label = unread
                ? `${ch.name}, ${ch.unreadCount > 99 ? "99+" : ch.unreadCount} unread`
                : ch.name
              const content = (
                <>
                  <Icon
                    className="size-3.5 shrink-0 opacity-70"
                    aria-hidden
                  />
                  <OverflowText className="min-w-0 flex-1">
                    {ch.name}
                  </OverflowText>
                  <UnreadBadge count={unread ? ch.unreadCount : 0} />
                </>
              )
              return (
                <li key={ch.id} className="min-w-0">
                  {onSelectChannel ? (
                    <button
                      type="button"
                      onClick={() => onSelectChannel(ch.id)}
                      className={cn("w-full text-left", rowClass(active, unread))}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      href={`/workspace/${workspaceId}/channels/${ch.id}`}
                      className={rowClass(active, unread)}
                      aria-label={label}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <div
          className="mt-4 flex items-center justify-between gap-2 px-2 pt-2"
          data-explore-tutorial="dms-list"
        >
          <h3 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Direct messages
          </h3>
          {onNewDmClick ? (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-6 text-primary"
              onClick={onNewDmClick}
              aria-label="New direct message"
            >
              <Plus className="size-3.5" />
            </Button>
          ) : null}
        </div>

        {dms.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">
            Message a teammate privately.
          </p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5">
            {dms.map((dm) => {
              const active = dm.id === activeChannelId
              const unread = !active && dm.unreadCount > 0
              const label = unread
                ? `${dm.peer.fullName}, ${dm.unreadCount > 99 ? "99+" : dm.unreadCount} unread`
                : dm.peer.fullName
              const content = (
                <>
                  <MessageSquare
                    className="size-3.5 shrink-0 opacity-70"
                    aria-hidden
                  />
                  <OverflowText className="min-w-0 flex-1">
                    {dm.peer.fullName}
                  </OverflowText>
                  <UnreadBadge count={unread ? dm.unreadCount : 0} />
                </>
              )
              return (
                <li key={dm.id} className="min-w-0">
                  {onSelectChannel ? (
                    <button
                      type="button"
                      onClick={() => onSelectChannel(dm.id)}
                      className={cn("w-full text-left", rowClass(active, unread))}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                    >
                      {content}
                    </button>
                  ) : (
                    <Link
                      href={`/workspace/${workspaceId}/channels/${dm.id}`}
                      className={rowClass(active, unread)}
                      aria-label={label}
                    >
                      {content}
                    </Link>
                  )}
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
