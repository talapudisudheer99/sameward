"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { workspaceInitials } from "@/components/workspace/workspace-display"
import { cn } from "@/lib/utils"
import type { WorkspaceListItem } from "@/lib/types/workspace/workspace-types"

interface WorkspaceRowProps {
  workspace: WorkspaceListItem
}

/** Quiet role copy — labels, not chips that compete with Create. */
function roleLabelClass(role: string): string {
  switch (role) {
    case "owner":
      return "text-primary/75"
    case "admin":
      return "text-amber-700/80 dark:text-amber-400/80"
    default:
      return "text-muted-foreground"
  }
}

/**
 * Workspace row — one clickable surface; Create stays the only strong CTA.
 */
function WorkspaceRow({ workspace }: WorkspaceRowProps) {
  const role = workspace.role.toLowerCase()
  const description = workspace.description?.trim()

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className={cn(
        "group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-border/70 bg-card px-4 py-3.5",
        "transition-[border-color,background-color,box-shadow] duration-200",
        "hover:border-primary/25 hover:bg-primary/[0.02]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
    >
      <div
        className="brand-tile flex size-10 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-semibold tracking-tight"
        aria-hidden
      >
        {workspaceInitials(workspace.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <span
            className="truncate font-heading text-[15px] font-semibold tracking-tight text-foreground"
            title={workspace.name}
          >
            {workspace.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-[11px] font-medium capitalize tracking-wide",
              roleLabelClass(role)
            )}
          >
            {workspace.role}
          </span>
        </div>
        {description ? (
          <span
            className="mt-0.5 block truncate text-xs leading-relaxed text-muted-foreground"
            title={description}
          >
            {description}
          </span>
        ) : null}
      </div>

      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary/70"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  )
}

interface WorkspaceListProps {
  workspaces: WorkspaceListItem[]
}

/**
 * Screen B — list of workspaces the user belongs to.
 * Parent (workspace/page.tsx) passes the data; this component only renders.
 */
export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {workspaces.map((ws) => (
        <WorkspaceRow key={ws.id} workspace={ws} />
      ))}
    </div>
  )
}
