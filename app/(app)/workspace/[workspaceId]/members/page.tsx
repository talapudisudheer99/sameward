"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ChevronRight,
  SearchX,
  ShieldMinus,
  UserMinus,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"

import ConfirmDialog from "@/components/dialogs/confirm-dialog"
import InviteMemberDialog from "@/components/dialogs/workspace/invite-member-dialog"
import Loader from "@/components/sharable/loader"
import OverflowText from "@/components/sharable/overflow-text"
import { Button, buttonVariants } from "@/components/ui/button"
import MembersTable, {
  type MemberRoleOption,
} from "@/components/workspace/members-table"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { cn } from "@/lib/utils"
import type { WorkspaceMemberListItem } from "@/lib/types/workspace/workspace-types"
import {
  useGetWorkspaceByIdQuery,
  useGetWorkspaceMembersQuery,
  useRemoveWorkspaceMemberMutation,
  useUpdateWorkspaceMemberRoleMutation,
} from "@/store/api/workspace/workspaces-api"

function canManageMembers(role: string | undefined): boolean {
  const r = role?.toLowerCase()
  return r === "owner" || r === "admin"
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return fallback
}

type PendingDemote = {
  member: WorkspaceMemberListItem
  role: MemberRoleOption
}

/**
 * Role UX:
 * - Discrete select → call API immediately (no debounce — debounce is for typing)
 * - Promote member → admin: immediate
 * - Demote admin → member: ConfirmDialog first (privilege removal)
 */
export default function WorkspaceMembersPage() {
  const params = useParams()
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : ""

  const [inviteOpen, setInviteOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] =
    useState<WorkspaceMemberListItem | null>(null)
  const [pendingDemote, setPendingDemote] = useState<PendingDemote | null>(null)
  const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<string | null>(
    null
  )

  const { user, emailVerified } = useCurrentUser()
  const [removeMember] = useRemoveWorkspaceMemberMutation()
  const [updateMemberRole] = useUpdateWorkspaceMemberRoleMutation()

  const {
    data: workspace,
    isLoading,
    isError,
  } = useGetWorkspaceByIdQuery({ workspaceId }, { skip: !workspaceId })

  const { data: membersData, isLoading: membersLoading } =
    useGetWorkspaceMembersQuery({ workspaceId }, { skip: !workspaceId })

  const members = membersData?.members ?? []
  const canManage = canManageMembers(workspace?.role)
  const isOwner = workspace?.role.toLowerCase() === "owner"
  const canInvite = canManage && emailVerified

  if (!workspaceId || isLoading || membersLoading) {
    return <Loader fullPage />
  }

  if (isError || !workspace) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground"
            aria-hidden
          >
            <SearchX className="size-8" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Workspace not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This workspace doesn&apos;t exist, or you don&apos;t have access.
          </p>
          <Link
            href="/workspace"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 h-10 px-5")}
          >
            Back to Workspaces
          </Link>
        </div>
      </section>
    )
  }

  const applyRoleChange = async (
    member: WorkspaceMemberListItem,
    role: MemberRoleOption
  ) => {
    setRoleUpdatingUserId(member.userId)
    try {
      await updateMemberRole({
        workspaceId,
        userId: member.userId,
        role,
      }).unwrap()
      toast.success(
        role === "admin"
          ? `${member.fullName || member.email} is now an admin`
          : `${member.fullName || member.email} is now a member`
      )
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn’t update role. Try again."))
      throw err
    } finally {
      setRoleUpdatingUserId(null)
    }
  }

  const onRoleChange = (
    member: WorkspaceMemberListItem,
    role: MemberRoleOption
  ) => {
    const current = member.role.toLowerCase()
    if (role === current) return

    // Demote = confirm; promote = immediate
    if (current === "admin" && role === "member") {
      setPendingDemote({ member, role })
      return
    }

    void applyRoleChange(member, role)
  }

  const onRemoveConfirm = async () => {
    if (!memberToRemove) return

    try {
      await removeMember({
        workspaceId,
        userId: memberToRemove.userId,
      }).unwrap()
      toast.success(
        `Removed ${memberToRemove.fullName || memberToRemove.email}`
      )
      setMemberToRemove(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn’t remove member. Try again."))
      throw err
    }
  }

  const onDemoteConfirm = async () => {
    if (!pendingDemote) return
    try {
      await applyRoleChange(pendingDemote.member, pendingDemote.role)
      setPendingDemote(null)
    } catch {
      // applyRoleChange already toasted; keep dialog open via rethrow
      throw new Error("demote_failed")
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href="/workspace"
          className="shrink-0 transition-colors hover:text-foreground"
        >
          Workspaces
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
        <Link
          href={`/workspace/${workspaceId}`}
          className="max-w-[40%] min-w-0 truncate transition-colors hover:text-foreground sm:max-w-[50%]"
          title={workspace.name}
        >
          {workspace.name}
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
        <span className="shrink-0 font-medium text-foreground">Members</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Members
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People in{" "}
            <OverflowText
              variant="ellipsis"
              className="inline-block max-w-[min(100%,16rem)] align-bottom font-medium text-foreground"
            >
              {workspace.name}
            </OverflowText>
            {members.length > 0 ? ` · ${members.length}` : null}
          </p>
        </div>

        {canInvite ? (
          <Button
            type="button"
            size="lg"
            className="h-9 shrink-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus data-icon="inline-start" />
            Send invite
          </Button>
        ) : null}
      </header>

      <MembersTable
        members={members}
        currentUserId={user?.id}
        canRemoveMembers={canManage}
        canChangeRoles={isOwner}
        roleUpdatingUserId={roleUpdatingUserId}
        onRemoveMember={setMemberToRemove}
        onRoleChange={onRoleChange}
      />

      {canInvite ? (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          workspaceId={workspaceId}
        />
      ) : null}

      <ConfirmDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
        title="Remove member?"
        description={
          memberToRemove ? (
            <>
              Remove{" "}
              <span className="font-medium text-foreground">
                {memberToRemove.fullName || memberToRemove.email}
              </span>{" "}
              from {workspace.name}? They’ll lose access until invited again.
            </>
          ) : (
            ""
          )
        }
        icon={UserMinus}
        variant="destructive"
        confirmLabel="Remove"
        loadingLabel="Removing…"
        onConfirm={onRemoveConfirm}
      />

      <ConfirmDialog
        open={pendingDemote !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDemote(null)
        }}
        title="Demote to member?"
        description={
          pendingDemote ? (
            <>
              <span className="font-medium text-foreground">
                {pendingDemote.member.fullName || pendingDemote.member.email}
              </span>{" "}
              will lose admin permissions (invite, remove, rename).
            </>
          ) : (
            ""
          )
        }
        icon={ShieldMinus}
        variant="destructive"
        confirmLabel="Demote"
        loadingLabel="Updating…"
        onConfirm={onDemoteConfirm}
      />
    </section>
  )
}
