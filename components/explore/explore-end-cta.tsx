"use client"

import { Button } from "@/components/ui/button"

type ExploreEndCtaProps = {
  onCreateWorkspace: () => void
}

/**
 * Stronger conversion strip after the user has explored.
 */
export default function ExploreEndCta({ onCreateWorkspace }: ExploreEndCtaProps) {
  return (
    <div
      className="flex shrink-0 flex-col gap-2 border-t border-border bg-brand-wash px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      data-explore-tutorial="create-cta"
    >
      <div className="min-w-0 space-y-0.5">
        <p className="font-heading text-sm font-semibold tracking-tight">
          Ready to bring your team here?
        </p>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Bring your team together and start building your own conversation
          history.
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="btn-brand-gradient shrink-0 self-stretch sm:self-center"
        onClick={onCreateWorkspace}
      >
        Create your workspace
      </Button>
    </div>
  )
}
