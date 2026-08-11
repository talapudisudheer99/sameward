"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

type ExploreDemoBannerProps = {
  onCreateWorkspace: () => void
  onReplayTour?: () => void
}

/**
 * Read-only demo chrome — label + value line + conversion CTA.
 */
export default function ExploreDemoBanner({
  onCreateWorkspace,
  onReplayTour,
}: ExploreDemoBannerProps) {
  return (
    <div
      className="flex shrink-0 flex-col gap-3 border-b border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
      data-explore-tutorial="demo-banner"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Link
          href="/workspace"
          className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Back to workspaces"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 space-y-0.5">
          <p className="flex flex-wrap items-center gap-2 font-heading text-sm font-semibold tracking-tight">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            TeamHub Demo
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Read-only
            </span>
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Explore how TeamHub helps your team stay on the same page.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        {onReplayTour ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={onReplayTour}
          >
            Replay tour
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="btn-brand-gradient shrink-0 self-stretch sm:self-center"
          onClick={onCreateWorkspace}
        >
          Create your workspace
        </Button>
      </div>
    </div>
  )
}
