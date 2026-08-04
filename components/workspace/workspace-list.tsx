"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import {
  WORKSPACE_ROLE_STYLES,
  workspaceInitials,
  workspaceTileColor,
} from "@/components/workspace/workspace-display"
import { cn } from "@/lib/utils"
import type { WorkspaceListItem } from "@/lib/types/workspace/workspace-types"

interface WorkspaceRowProps {
  workspace: WorkspaceListItem
}

function WorkspaceRow({ workspace }: WorkspaceRowProps) {
  const role = workspace.role.toLowerCase()

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white",
          workspaceTileColor(workspace.name)
        )}
        aria-hidden
      >
        {workspaceInitials(workspace.name)}
      </div>

      <span
        className="min-w-0 flex-1 truncate font-medium text-foreground"
        title={workspace.name}
      >
        {workspace.name}
      </span>

      <span
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
          WORKSPACE_ROLE_STYLES[role] ?? WORKSPACE_ROLE_STYLES.member
        )}
      >
        {workspace.role}
      </span>

      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        strokeWidth={2}
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
    <div className="flex flex-col gap-2">
      {workspaces.map((ws) => (
        <WorkspaceRow key={ws.id} workspace={ws} />
      ))}
    </div>
  )
}
