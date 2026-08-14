"use client"

import { useState, type ReactNode } from "react"

import {
  MESSAGE_COLLAPSE_AT,
  collapseMessagePreview,
} from "@/lib/channels/message-bubble"
import { cn } from "@/lib/utils"

/** Highlight @Full Name tokens and http(s) links for mentioned users. */
export function renderBodyWithMentions(
  body: string,
  mentionedUserIds: string[] | undefined,
  mentionNameById: Record<string, string> | undefined,
  mine: boolean
): ReactNode {
  const names = (mentionedUserIds ?? [])
    .map((id) => mentionNameById?.[id])
    .filter((n): n is string => Boolean(n))
    .sort((a, b) => b.length - a.length)

  const escaped = names.map((n) =>
    n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
  const namePattern = escaped.length > 0 ? `(?:${escaped.join("|")})` : null
  const re = new RegExp(
    `(https?:\\/\\/[^\\s<>"'\\\`)\\]]+|@all\\b${namePattern ? `|@${namePattern}` : ""})`,
    "gi"
  )
  const parts = body.split(re)

  if (parts.length === 1) return body

  return parts.map((part, i) => {
    if (/^https?:\/\//i.test(part)) {
      const href = part.replace(/[),.;:!?\]]+$/, "")
      const trailing = part.slice(href.length)
      return (
        <span key={`u-${i}`}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline underline-offset-2 break-all",
              mine
                ? "text-primary-foreground decoration-primary-foreground/55 hover:decoration-primary-foreground"
                : "text-primary decoration-primary/40 hover:decoration-primary"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {href}
          </a>
          {trailing}
        </span>
      )
    }
    const isAll = part.toLowerCase() === "@all"
    const isNamedMention =
      part.startsWith("@") && names.some((n) => part === `@${n}`)
    if (isAll || isNamedMention) {
      return (
        <span
          key={`${part}-${i}`}
          className={cn(
            "font-semibold",
            mine
              ? "text-primary-foreground underline decoration-primary-foreground/55 underline-offset-2"
              : "rounded-md bg-primary/12 px-1 py-0.5 text-primary"
          )}
        >
          {part}
        </span>
      )
    }
    return <span key={`t-${i}`}>{part}</span>
  })
}

type MessageBodyTextProps = {
  body: string
  mentionedUserIds?: string[]
  mentionNameById?: Record<string, string>
  mine: boolean
}

/** Truncate long bubbles (~500 chars) with See more / Show less. */
export default function MessageBodyText({
  body,
  mentionedUserIds,
  mentionNameById,
  mine,
}: MessageBodyTextProps) {
  const [expanded, setExpanded] = useState(false)
  const needsCollapse = body.length > MESSAGE_COLLAPSE_AT
  const shown =
    !needsCollapse || expanded ? body : collapseMessagePreview(body)

  return (
    <div>
      <p className="wrap-anywhere whitespace-pre-wrap">
        {renderBodyWithMentions(
          shown,
          mentionedUserIds,
          mentionNameById,
          mine
        )}
        {needsCollapse && !expanded ? "…" : null}
      </p>
      {needsCollapse ? (
        <button
          type="button"
          className={cn(
            "mt-1.5 text-xs font-bold underline-offset-2 hover:underline",
            mine
              ? "text-primary-foreground/95"
              : "text-primary"
          )}
          aria-expanded={expanded}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {expanded ? "Show less" : "See more"}
        </button>
      ) : null}
    </div>
  )
}
