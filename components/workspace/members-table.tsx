"use client"

import { UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  WORKSPACE_ROLE_STYLES,
  workspaceInitials,
  workspaceTileColor,
} from "@/components/workspace/workspace-display"
import { cn } from "@/lib/utils"
import type { WorkspaceMemberListItem } from "@/lib/types/workspace/workspace-types"

export type MemberRoleOption = "member" | "admin"

interface MembersTableProps {
  members: WorkspaceMemberListItem[]
  currentUserId?: string
  /** Owner/admin can remove others (not owners) */
  canRemoveMembers?: boolean
  /** Owner can change member ↔ admin via select (immediate / confirm in parent) */
  canChangeRoles?: boolean
  /** userId currently saving a role change */
  roleUpdatingUserId?: string | null
  onRemoveMember?: (member: WorkspaceMemberListItem) => void
  onRoleChange?: (
    member: WorkspaceMemberListItem,
    role: MemberRoleOption
  ) => void
}

/**
 * Screen E — members list (presentational).
 * Parent owns remove confirm + role mutate (immediate promote, confirm demote).
 */
export default function MembersTable({
  members,
  currentUserId,
  canRemoveMembers = false,
  canChangeRoles = false,
  roleUpdatingUserId = null,
  onRemoveMember,
  onRoleChange,
}: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No members yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite teammates by email to collaborate here.
        </p>
      </div>
    )
  }

  const showActions = canRemoveMembers || canChangeRoles

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className={cn(
          "hidden gap-4 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid",
          showActions ? "grid-cols-[1fr_7.5rem_auto]" : "grid-cols-[1fr_auto]"
        )}
      >
        <span>Member</span>
        <span>Role</span>
        {showActions ? <span className="w-20 text-right">Actions</span> : null}
      </div>

      <ul className="divide-y divide-border">
        {members.map((member) => {
          const role = member.role.toLowerCase()
          const isSelf = currentUserId === member.userId
          const isOwner = role === "owner"
          const canRemoveThis =
            canRemoveMembers && !isSelf && !isOwner && Boolean(onRemoveMember)
          const canEditRole =
            canChangeRoles && !isOwner && Boolean(onRoleChange)
          const isUpdating = roleUpdatingUserId === member.userId

          return (
            <li
              key={member.userId}
              className={cn(
                "flex flex-wrap items-center gap-3 px-4 py-3.5 sm:grid sm:gap-4",
                showActions
                  ? "sm:grid-cols-[1fr_7.5rem_auto]"
                  : "sm:grid-cols-[1fr_auto]"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    workspaceTileColor(member.fullName || member.email)
                  )}
                  aria-hidden
                >
                  {workspaceInitials(member.fullName || member.email)}
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium text-foreground"
                    title={member.fullName || "Unknown"}
                  >
                    {member.fullName || "Unknown"}
                    {isSelf ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={member.email}
                  >
                    {member.email}
                  </p>
                </div>
              </div>

              {canEditRole ? (
                <select
                  className={cn(
                    "h-8 w-full max-w-[7.5rem] rounded-lg border border-border bg-background px-2 text-xs font-medium capitalize outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    WORKSPACE_ROLE_STYLES[role] ?? WORKSPACE_ROLE_STYLES.member
                  )}
                  value={role === "admin" ? "admin" : "member"}
                  disabled={isUpdating}
                  aria-label={`Role for ${member.fullName || member.email}`}
                  onChange={(e) => {
                    const next = e.target.value as MemberRoleOption
                    if (next !== role) {
                      onRoleChange?.(member, next)
                    }
                  }}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span
                  className={cn(
                    "inline-flex h-8 w-fit items-center rounded-full border px-2.5 text-xs font-medium capitalize",
                    WORKSPACE_ROLE_STYLES[role] ?? WORKSPACE_ROLE_STYLES.member
                  )}
                >
                  {member.role}
                </span>
              )}

              {showActions ? (
                <div className="ml-auto flex w-20 justify-end sm:ml-0">
                  {canRemoveThis ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onRemoveMember?.(member)}
                            aria-label={`Remove ${member.fullName || member.email}`}
                          />
                        }
                      >
                        <UserMinus className="size-4" />
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        Remove from workspace
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="size-7" aria-hidden />
                  )}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
