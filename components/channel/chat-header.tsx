"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Hash,
  Lock,
  Pencil,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import type { ChannelListItem } from "@/lib/types/channel/channel-types"

type ChatHeaderProps = {
  channel: ChannelListItem
  memberCount?: number
  onlineCount?: number
  canManage: boolean
  /** Mobile: back to channel list */
  backHref?: string
  onRename?: () => void
  onDelete?: () => void
  onInvite?: () => void
  onToggleMembers?: () => void
  onOpenAi?: () => void
}

/**
 * Ch-D header — channel title, presence counts, manage actions.
 */
export default function ChatHeader({
  channel,
  memberCount,
  onlineCount,
  canManage,
  backHref,
  onRename,
  onDelete,
  onInvite,
  onToggleMembers,
  onOpenAi,
}: ChatHeaderProps) {
  const Icon = channel.visibility === "private" ? Lock : Hash

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Back to channels"
        >
          <ArrowLeft className="size-4" />
        </Link>
      ) : null}

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <OverflowText
          as="h1"
          variant="ellipsis"
          className="font-heading text-base font-semibold tracking-tight"
        >
          {channel.name}
        </OverflowText>
        <span className="hidden text-xs text-muted-foreground lg:inline">
          {memberCount != null ? `${memberCount} members` : null}
          {memberCount != null && onlineCount != null ? " · " : null}
          {onlineCount != null ? `${onlineCount} online` : null}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {onOpenAi ? (
          <Button
            type="button"
            size="sm"
            onClick={onOpenAi}
            aria-label="Open AI assistant"
            className="btn-brand-gradient gap-1.5 shadow-sm"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">AI</span>
          </Button>
        ) : null}
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
            className="hidden sm:inline-flex"
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
            className="hidden text-destructive hover:text-destructive sm:inline-flex"
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
