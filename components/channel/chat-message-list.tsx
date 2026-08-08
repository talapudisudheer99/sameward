"use client"

import { useEffect, useRef } from "react"
import { FileText } from "lucide-react"

import Loader from "@/components/sharable/loader"
import OverflowText from "@/components/sharable/overflow-text"
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

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
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
          "flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-muted-foreground",
          className
        )}
      >
        No messages yet. Say hello.
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
                    "w-fit max-w-full rounded-2xl px-3 py-1.5 text-left text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.body}</p>
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
                <ul
                  className={cn(
                    "flex flex-col gap-2",
                    mine ? "items-end" : "items-start"
                  )}
                >
                  {msg.attachments.map((att) => {
                    const isImage = att.mime.startsWith("image/")
                    return (
                      <li
                        key={`${msg.id}-${att.url}`}
                        className={cn(
                          "overflow-hidden rounded-xl border border-border bg-card text-left",
                          mine && "border-primary/30"
                        )}
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.url}
                            alt={att.name}
                            className="max-h-48 max-w-full object-cover"
                          />
                        ) : (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                          >
                            <FileText className="size-4 text-primary" />
                            <span className="min-w-0">
                              <OverflowText className="font-medium">
                                {att.name}
                              </OverflowText>
                              <span className="block text-xs text-muted-foreground">
                                {formatBytes(att.sizeBytes)}
                              </span>
                            </span>
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </article>
        )
      })}
      <div ref={bottomRef} aria-hidden />
    </div>
  )
}
