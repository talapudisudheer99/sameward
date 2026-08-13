"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Hash,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import OverflowText from "@/components/sharable/overflow-text"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { ChannelListItem } from "@/lib/types/channel/channel-types"

type ChatHeaderProps = {
  channel: ChannelListItem
  memberCount?: number
  onlineCount?: number
  canManage: boolean
  /** Mobile: back to channel list */
  backHref?: string
  /** Mobile: in-place back (Explore demo) — preferred over backHref when set */
  onBack?: () => void
  onRename?: () => void
  onDelete?: () => void
  onInvite?: () => void
  onToggleMembers?: () => void
  onOpenAi?: () => void
}

/**
 * Chat header — channel / DM title, presence, manage actions.
 */
export default function ChatHeader({
  channel,
  memberCount,
  onlineCount,
  canManage,
  backHref,
  onBack,
  onRename,
  onDelete,
  onInvite,
  onToggleMembers,
  onOpenAi,
}: ChatHeaderProps) {
  const isDm = channel.visibility === "dm"
  const Icon = isDm
    ? MessageSquare
    : channel.visibility === "private"
      ? Lock
      : Hash

  const showMobileManage =
    !isDm && canManage && Boolean(onRename || (onDelete && !channel.isDefault))

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Back to channels"
        >
          <ArrowLeft className="size-4" />
        </button>
      ) : backHref ? (
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
        {!isDm ? (
          <span className="hidden text-xs text-muted-foreground lg:inline">
            {memberCount != null ? `${memberCount} members` : null}
            {memberCount != null && onlineCount != null ? " · " : null}
            {onlineCount != null ? `${onlineCount} online` : null}
          </span>
        ) : (
          <span className="hidden text-xs text-muted-foreground lg:inline">
            Direct message
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {onOpenAi ? (
          <Button
            type="button"
            size="sm"
            onClick={onOpenAi}
            aria-label="Open AI assistant"
            data-explore-tutorial="channel-ai"
            className="btn-brand-gradient gap-1.5 shadow-sm"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">AI</span>
          </Button>
        ) : null}
        {!isDm && channel.visibility === "private" && canManage && onInvite ? (
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
        {!isDm && onToggleMembers ? (
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

        {showMobileManage ? (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="sm:hidden"
                  aria-label="Channel actions"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="w-44 rounded-xl border border-border bg-card p-1 shadow-md"
            >
              {onRename ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted"
                  onClick={onRename}
                >
                  <Pencil className="size-3.5" />
                  Rename
                </button>
              ) : null}
              {onDelete && !channel.isDefault ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-destructive hover:bg-muted"
                  onClick={onDelete}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : null}

        {!isDm && canManage && onRename ? (
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
        {!isDm && canManage && !channel.isDefault && onDelete ? (
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
