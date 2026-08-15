"use client"

import { useId } from "react"

import { cn } from "@/lib/utils"

type TeamHubLogoProps = {
  className?: string
  /** mark = icon only · horizontal = icon + wordmark · stacked = icon above wordmark */
  variant?: "mark" | "horizontal" | "stacked"
  /** Pixel height of the mark (wordmark scales with it). */
  size?: number
  /** Accessible name when logo is the sole content of a link */
  title?: string
  /** onDark = white wordmark for navy/marketing panels */
  tone?: "default" | "onDark"
}

function LogoMark({
  size,
  className,
  gradientId,
  tone,
}: {
  size: number
  className?: string
  gradientId: string
  tone: "default" | "onDark"
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand-a)" />
          <stop
            offset="1"
            stopColor={tone === "onDark" ? "var(--brand-b)" : "var(--primary)"}
          />
        </linearGradient>
      </defs>

      <g
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        strokeLinejoin="round"
      >
        <path d="M12.6 5.4 29.4 16 12.6 26.6 18.2 16Z" strokeWidth="2.2" />
        <path
          d="M2.6 8.7 13.3 16 2.6 23.3 6.6 16Z"
          strokeWidth="1.8"
          opacity={tone === "onDark" ? "0.55" : "0.42"}
        />
      </g>
    </svg>
  )
}

/**
 * Sameward brand mark — two tapered wings travelling the same way
 * ("ward" = direction). Unique gradient ids per instance so multiple logos
 * never blank out. Export name kept for compatibility (file path unchanged).
 */
export function TeamHubLogo({
  className,
  variant = "mark",
  size = 28,
  title = "Sameward",
  tone = "default",
}: TeamHubLogoProps) {
  const uid = useId().replace(/:/g, "")
  const gradientId = `teamhub-mark-${uid}`

  if (variant === "mark") {
    return (
      <span
        className={cn("inline-flex shrink-0", className)}
        role="img"
        aria-label={title}
      >
        <LogoMark size={size} gradientId={gradientId} tone={tone} />
      </span>
    )
  }

  const wordmark = (
    <span
      className={cn(
        "font-heading font-bold tracking-[-0.03em]",
        tone === "onDark" ? "text-white" : "text-foreground",
      )}
    >
      Same
      <span
        style={{
          color: tone === "onDark" ? "var(--brand-b)" : "var(--primary)",
        }}
      >
        ward
      </span>
    </span>
  )

  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center gap-1.5", className)}
        role="img"
        aria-label={title}
      >
        <LogoMark size={size} gradientId={gradientId} tone={tone} />
        <span className="text-center text-sm leading-tight">{wordmark}</span>
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={title}
      style={{ fontSize: Math.max(14, Math.round(size * 0.54)) }}
    >
      <LogoMark size={size} gradientId={gradientId} tone={tone} />
      {wordmark}
    </span>
  )
}
