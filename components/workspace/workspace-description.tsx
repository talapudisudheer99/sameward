"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

type WorkspaceDescriptionProps = {
  text: string
  className?: string
}

/**
 * Caps long workspace blurbs under the title — expand only when needed.
 */
export default function WorkspaceDescription({
  text,
  className,
}: WorkspaceDescriptionProps) {
  const [expanded, setExpanded] = useState(false)
  const trimmed = text.trim()
  const needsClamp = trimmed.length > 120

  return (
    <div className={cn("mt-2 max-w-xl", className)}>
      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          !expanded && needsClamp && "line-clamp-2"
        )}
      >
        {trimmed}
      </p>
      {needsClamp ? (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-primary hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  )
}
