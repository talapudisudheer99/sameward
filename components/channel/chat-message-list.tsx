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
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4",
        className
      )}
    >
      {messages.map((msg) => {
        const mine = msg.authorId === currentUserId
        return (
          <article
            key={msg.id}
            className={cn(
              "flex max-w-[min(100%,28rem)] gap-2",
              mine ? "ml-auto flex-row-reverse" : "mr-auto",
              msg.pending && "opacity-70"
            )}
          >
            <span
              className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
              aria-hidden
            >
              {(msg.authorName || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className={cn("min-w-0 space-y-1", mine && "text-right")}>
              <div
                className={cn(
                  "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs text-muted-foreground",
                  mine && "flex-row-reverse"
                )}
              >
                <span className="font-medium text-foreground">
                  {msg.authorName}
                </span>
                <time dateTime={msg.createdAt}>
                  {formatTime(msg.createdAt)}
                </time>
                {msg.pending ? <span>Sending…</span> : null}
                {msg.failed ? (
                  <span className="text-destructive">Failed</span>
                ) : null}
              </div>
              {msg.body ? (
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-left text-sm leading-relaxed",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">{msg.body}</p>
                </div>
              ) : null}
              {msg.attachments.length > 0 ? (
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
