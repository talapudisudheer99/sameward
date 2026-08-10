"use client"

import { useEffect, useRef } from "react"
import { MessageCircle, Sparkles } from "lucide-react"

import ChatAttachments from "@/components/channel/chat-attachments"
import Loader from "@/components/sharable/loader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types/channel/channel-types"

type ChatMessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
  /** Initial history fetch in flight */
  isLoading?: boolean
  /** History request failed */
  isError?: boolean
  className?: string
  /** Path A — open explain dialog for this message */
  onExplainMessage?: (messageId: string) => void
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

/**
 * Ch-D transcript — presentational.
 * Parent passes messages from RTK GET; socket appends later.
 */
export default function ChatMessageList({
  messages,
  currentUserId,
  isLoading = false,
  isError = false,
  className,
  onExplainMessage,
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
        "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4",
        className
      )}
    >
      {messages.map((msg, i) => {
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
              "flex max-w-[min(85%,32rem)] gap-2",
              grouped ? "mt-0.5" : "mt-3",
              mine ? "ml-auto flex-row-reverse" : "mr-auto",
              msg.pending && "opacity-70"
            )}
          >
            {grouped ? (
              <span className="w-7 shrink-0" aria-hidden />
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
                  <span className="font-medium text-foreground">
                    {msg.authorName}
                  </span>
                  <time dateTime={msg.createdAt}>
                    {formatTime(msg.createdAt)}
                  </time>
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
                  <p className="break-words whitespace-pre-wrap">{msg.body}</p>
                  {onExplainMessage && !msg.pending ? (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="secondary"
                      className={cn(
                        "absolute -top-2 opacity-0 transition-opacity group-hover/msg:opacity-100",
                        mine ? "-left-2" : "-right-2"
                      )}
                      aria-label="Explain message"
                      onClick={() => onExplainMessage(msg.id)}
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
                  onClick={() => onExplainMessage(msg.id)}
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
