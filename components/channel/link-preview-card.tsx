"use client"

import { useState } from "react"
import { ArrowUpRight, Globe } from "lucide-react"

import type { LinkPreview } from "@/lib/types/channel/link-preview"
import { cn } from "@/lib/utils"

type LinkPreviewCardProps = {
  preview: LinkPreview
  mine?: boolean
  /** Flush under a text bubble — one message unit (WhatsApp/Slack style) */
  attached?: boolean
  className?: string
}

/**
 * Pretty Open Graph unfurl — Ocean Blue brand.
 * Use `attached` when stacking under message text so it reads as one bubble.
 */
export default function LinkPreviewCard({
  preview,
  mine = false,
  attached = false,
  className,
}: LinkPreviewCardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const [faviconFailed, setFaviconFailed] = useState(false)
  const href = preview.finalUrl || preview.url
  let host = preview.siteName
  try {
    host = preview.siteName || new URL(href).hostname.replace(/^www\./, "")
  } catch {
    host = preview.siteName || href
  }

  const showImage = Boolean(preview.imageUrl) && !imgFailed

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group/og relative block w-full overflow-hidden text-left",
        "bg-card transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        attached
          ? "rounded-none border-0 shadow-none ring-0 hover:bg-muted/35"
          : cn(
              "max-w-[min(100%,26rem)] rounded-2xl border border-border/80 shadow-sm ring-1 ring-foreground/5 sm:max-w-[min(100%,30rem)]",
              "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md hover:ring-primary/20",
              mine && "ml-auto"
            ),
        className
      )}
    >
      {!attached ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-[color-mix(in_oklab,var(--brand-b)_12%,transparent)] opacity-90"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[linear-gradient(to_bottom,var(--primary),color-mix(in_oklab,var(--brand-b)_75%,var(--primary)))]"
        />
      )}

      {showImage ? (
        <div
          className={cn(
            "relative w-full overflow-hidden bg-muted",
            attached ? "aspect-[2.4/1] max-h-40" : "aspect-[1.91/1]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.imageUrl!}
            alt=""
            className="size-full object-cover transition duration-500 group-hover/og:scale-[1.02]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card via-card/50 to-transparent"
          />
        </div>
      ) : (
        <div className="relative flex h-12 items-end overflow-hidden px-3 pb-1.5 pt-2">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklab,var(--brand-a)_28%,transparent),transparent_55%),radial-gradient(90%_70%_at_100%_20%,color-mix(in_oklab,var(--brand-b)_22%,transparent),transparent_50%)]"
          />
          <span className="relative inline-flex size-8 items-center justify-center rounded-lg bg-card/80 shadow-sm ring-1 ring-border/70 backdrop-blur-sm">
            {!faviconFailed && preview.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.faviconUrl}
                alt=""
                className="size-3.5 rounded-sm"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setFaviconFailed(true)}
              />
            ) : (
              <Globe className="size-3.5 text-primary" strokeWidth={1.75} />
            )}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative space-y-1 pb-3 pt-2",
          attached ? "px-3 pl-3.5" : "px-3.5"
        )}
      >
        <div className="flex items-center gap-1.5">
          {showImage && !faviconFailed && preview.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.faviconUrl}
              alt=""
              className="size-3.5 shrink-0 rounded-sm"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFaviconFailed(true)}
            />
          ) : null}
          <span className="min-w-0 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {host}
          </span>
          <ArrowUpRight
            className="ml-auto size-3.5 shrink-0 text-muted-foreground/70 transition group-hover/og:text-primary"
            strokeWidth={2}
            aria-hidden
          />
        </div>

        <p className="font-heading text-[0.9rem] leading-snug font-semibold tracking-tight text-card-foreground line-clamp-2">
          {preview.title}
        </p>

        {preview.description ? (
          <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
            {preview.description}
          </p>
        ) : null}
      </div>
    </a>
  )
}
