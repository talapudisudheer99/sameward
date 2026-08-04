"use client"

import { Hash, Lock, Pencil, Trash2, UserPlus, Users } from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import type { ChannelListItem } from "@/lib/types/channel/channel-types"

type ChatHeaderProps = {
  channel: ChannelListItem
  memberCount?: number
  onlineCount?: number
  canManage: boolean
  onRename?: () => void
  onDelete?: () => void
  onInvite?: () => void
  onToggleMembers?: () => void
}

/**
 * Ch-D header — channel title, presence counts, manage actions.
 */
export default function ChatHeader({
  channel,
  memberCount,
  onlineCount,
  canManage,
  onRename,
  onDelete,
  onInvite,
  onToggleMembers,
}: ChatHeaderProps) {
  const Icon = channel.visibility === "private" ? Lock : Hash

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <OverflowText
          as="h1"
          variant="ellipsis"
          className="font-heading text-base font-semibold tracking-tight"
        >
          {channel.name}
        </OverflowText>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {memberCount != null ? `${memberCount} members` : null}
          {memberCount != null && onlineCount != null ? " · " : null}
          {onlineCount != null ? `${onlineCount} online` : null}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {channel.visibility === "private" && canManage && onInvite ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onInvite}
            aria-label="Invite to channel"
          >
            <UserPlus className="size-4" />
          </Button>
        ) : null}
        {onToggleMembers ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onToggleMembers}
            aria-label="Members"
          >
            <Users className="size-4" />
          </Button>
        ) : null}
        {canManage && onRename ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onRename}
            aria-label="Rename channel"
          >
            <Pencil className="size-4" />
          </Button>
        ) : null}
        {canManage && !channel.isDefault && onDelete ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete channel"
          >
            <Trash2 className="size-4" />
          </Button>
        ) : null}
      </div>
    </header>
  )
}
