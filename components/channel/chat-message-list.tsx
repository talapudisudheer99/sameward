"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Sparkles } from "lucide-react"

import ChatAttachments from "@/components/channel/chat-attachments"
import Loader from "@/components/sharable/loader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types/channel/channel-types"

type ChatMessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
  /** userId → display name for highlighting @mentions */
  mentionNameById?: Record<string, string>
  /** Initial history fetch in flight */
  isLoading?: boolean
  /** History request failed */
  isError?: boolean
  className?: string
  /** Path A — open explain dialog for this message */
  onExplainMessage?: (target: {
    id: string
    body: string
    authorName: string
    attachmentNames: string[]
  }) => void
  /** Profile v1 — open author card */
  onOpenProfile?: (target: { userId: string; name: string }) => void
  /** Explore tour — keep Explain visible on this message */
  tutorialPinExplainMessageId?: string
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

/** Avoid SSR/client locale mismatch on `<time>` text (Node vs browser). */
function MessageTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    setLabel(formatTime(iso))
  }, [iso])

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label ?? ""}
    </time>
  )
}

/** Highlight @Full Name tokens for mentioned users. */
function renderBodyWithMentions(
  body: string,
  mentionedUserIds: string[] | undefined,
  mentionNameById: Record<string, string> | undefined,
  mine: boolean
) {
  const names = (mentionedUserIds ?? [])
    .map((id) => mentionNameById?.[id])
    .filter((n): n is string => Boolean(n))
    .sort((a, b) => b.length - a.length)

  if (names.length === 0) return body

  const escaped = names.map((n) =>
    n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
  const re = new RegExp(`(@(?:${escaped.join("|")}))`, "g")
  const parts = body.split(re)

  return parts.map((part, i) => {
    if (part.startsWith("@") && names.some((n) => part === `@${n}`)) {
      return (
        <span
          key={`${part}-${i}`}
          className={cn(
            "font-semibold",
            mine
              ? "text-primary-foreground underline decoration-primary-foreground/50"
              : "text-primary"
          )}
        >
          {part}
        </span>
      )
    }
    return <span key={`t-${i}`}>{part}</span>
  })
}

/**
 * Ch-D transcript — presentational.
 * Parent passes messages from RTK GET; socket appends later.
 */
export default function ChatMessageList({
  messages,
  currentUserId,
  mentionNameById,
  isLoading = false,
  isError = false,
  className,
  onExplainMessage,
  onOpenProfile,
  tutorialPinExplainMessageId,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Stick to bottom when messages change (send / first load)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 items-center justify-center",
          className
        )}
      >
        <Loader className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground",
          className
        )}
      >
        Couldn’t load messages. Try refreshing.
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "bg-brand-wash flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center",
          className
        )}
      >
        <span
          className="brand-tile flex size-11 items-center justify-center rounded-full"
          aria-hidden
        >
          <MessageCircle className="size-5" strokeWidth={1.5} />
        </span>
        <p className="text-sm text-muted-foreground">
          No messages yet. Say hello.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3 sm:px-4 sm:py-4",
        className
      )}
      data-explore-tutorial="transcript"
    >
      {messages.map((msg, i) => {
        const pinExplain = msg.id === tutorialPinExplainMessageId
        const mine = msg.authorId === currentUserId
        const prev = messages[i - 1]
        // Group consecutive messages by the same author within ~5 minutes
        const grouped =
          prev?.authorId === msg.authorId &&
          new Date(msg.createdAt).getTime() -
            new Date(prev?.createdAt ?? 0).getTime() <
            5 * 60 * 1000
        const hasAttachments = msg.attachments.length > 0

        return (
          <article
            key={msg.id}
            className={cn(
              "flex max-w-[min(92%,20rem)] gap-2 sm:max-w-[min(85%,32rem)]",
              grouped ? "mt-0.5" : "mt-3",
              mine ? "ml-auto flex-row-reverse" : "mr-auto",
              msg.pending && "opacity-70"
            )}
          >
            {grouped ? (
              <span className="w-7 shrink-0" aria-hidden />
            ) : onOpenProfile ? (
              <button
                type="button"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium outline-none hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ${msg.authorName}'s profile`}
                onClick={() =>
                  onOpenProfile({
                    userId: msg.authorId,
                    name: msg.authorName,
                  })
                }
              >
                {(msg.authorName || "?").slice(0, 1).toUpperCase()}
              </button>
            ) : (
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                aria-hidden
              >
                {(msg.authorName || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div
              className={cn(
                "flex min-w-0 flex-col gap-1",
                mine ? "items-end" : "items-start"
              )}
            >
              {grouped ? null : (
                <div
                  className={cn(
                    "flex items-baseline gap-x-2 px-1 text-xs text-muted-foreground",
                    mine && "flex-row-reverse"
                  )}
                >
                  {onOpenProfile ? (
                    <button
                      type="button"
                      className="font-medium text-foreground hover:underline"
                      onClick={() =>
                        onOpenProfile({
                          userId: msg.authorId,
                          name: msg.authorName,
                        })
                      }
                    >
                      {msg.authorName}
                    </button>
                  ) : (
                    <span className="font-medium text-foreground">
                      {msg.authorName}
                    </span>
                  )}
                  <MessageTime iso={msg.createdAt} />
                </div>
              )}
              {msg.body ? (
                <div
                  className={cn(
                    "group/msg relative w-fit max-w-full rounded-2xl px-3 py-1.5 text-left text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  )}
                >
                  <p className="[overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                    {renderBodyWithMentions(
                      msg.body,
                      msg.mentionedUserIds,
                      mentionNameById,
                      mine
                    )}
                  </p>
                  {onExplainMessage && !msg.pending ? (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      className={cn(
                        "absolute -top-2 shadow-sm transition-opacity",
                        pinExplain
                          ? "opacity-100 ring-2 ring-primary"
                          : "opacity-0 group-hover/msg:opacity-100",
                        mine ? "-left-2" : "-right-2"
                      )}
                      aria-label="Explain message"
                      data-explore-tutorial={
                        pinExplain ? "explain-button" : undefined
                      }
                      onClick={() =>
                        onExplainMessage({
                          id: msg.id,
                          body: msg.body,
                          authorName: msg.authorName,
                          attachmentNames: msg.attachments.map((a) => a.name),
                        })
                      }
                    >
                      <Sparkles className="size-3" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {(msg.pending || msg.failed) && (
                <span
                  className={cn(
                    "px-1 text-xs",
                    msg.failed ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {msg.failed ? "Failed" : "Sending…"}
                </span>
              )}
              {hasAttachments ? (
                <ChatAttachments attachments={msg.attachments} mine={mine} />
              ) : null}
              {!msg.body && onExplainMessage && !msg.pending ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                  onClick={() =>
                    onExplainMessage({
                      id: msg.id,
                      body: msg.body,
                      authorName: msg.authorName,
                      attachmentNames: msg.attachments.map((a) => a.name),
                    })
                  }
                >
                  <Sparkles className="size-3" />
                  Explain
                </Button>
              ) : null}
            </div>
          </article>
        )
      })}
      <div ref={bottomRef} aria-hidden />
    </div>
  )
}
