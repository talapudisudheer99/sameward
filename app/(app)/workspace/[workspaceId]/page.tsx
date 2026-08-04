"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronRight,
  Hash,
  LogOut,
  Pencil,
  SearchX,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import ConfirmDialog from "@/components/dialogs/confirm-dialog"
import InviteMemberDialog from "@/components/dialogs/workspace/invite-member-dialog"
import RenameWorkspaceDialog from "@/components/dialogs/workspace/rename-workspace-dialog"
import Loader from "@/components/sharable/loader"
import OverflowText from "@/components/sharable/overflow-text"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { useCurrentUser } from "@/hooks/use-current-user"
import { cn } from "@/lib/utils"
import {
  useDeleteWorkspaceMutation,
  useGetWorkspaceByIdQuery,
  useLeaveWorkspaceMutation,
} from "@/store/api/workspace/workspaces-api"

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number | string }).status === 404
  )
}

function canManageMembers(role: string): boolean {
  const r = role.toLowerCase()
  return r === "owner" || r === "admin"
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return fallback
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : ""

  const [inviteOpen, setInviteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { emailVerified } = useCurrentUser()
  const [leaveWorkspace] = useLeaveWorkspaceMutation()
  const [deleteWorkspace] = useDeleteWorkspaceMutation()

  const { data, isLoading, isError, error, isFetching } =
    useGetWorkspaceByIdQuery({ workspaceId }, { skip: !workspaceId })

  if (!workspaceId || isLoading || (isFetching && !data && !isError)) {
    return <Loader fullPage />
  }

  if (isError || !data) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex size-16 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground"
            aria-hidden
          >
            <SearchX className="size-8" strokeWidth={1.5} />
          </div>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Workspace not found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {isNotFoundError(error)
              ? "This workspace doesn’t exist, or you don’t have access to it."
              : "Something went wrong loading this workspace. Try again from your list."}
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

  const role = data.role.toLowerCase()
  const roleClass = WORKSPACE_ROLE_STYLES[role] ?? WORKSPACE_ROLE_STYLES.member
  const manage = canManageMembers(data.role)
  const isOwner = role === "owner"
  const canInvite = manage && emailVerified
  const membersHref = `/workspace/${workspaceId}/members`
  const channelsHref = `/workspace/${workspaceId}/channels`

  const onLeaveConfirm = async () => {
    try {
      await leaveWorkspace({ workspaceId }).unwrap()
      toast.success(`You left ${data.name}`)
      router.replace("/workspace")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn’t leave workspace. Try again."))
      throw err
    }
  }

  const onDeleteConfirm = async () => {
    try {
      await deleteWorkspace({ workspaceId }).unwrap()
      toast.success(`${data.name} deleted`)
      router.replace("/workspace")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn’t delete workspace. Try again."))
      throw err
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link
          href="/workspace"
          className="shrink-0 transition-colors hover:text-foreground"
        >
          Workspaces
        </Link>
        <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
        <OverflowText
          variant="ellipsis"
          className="font-medium text-foreground"
        >
          {data.name}
        </OverflowText>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm",
              workspaceTileColor(data.name)
            )}
            aria-hidden
          >
            {workspaceInitials(data.name)}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start gap-2.5">
              <OverflowText
                as="h1"
                variant="title"
                className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
              >
                {data.name}
              </OverflowText>
              <div className="flex shrink-0 items-center gap-1.5 pt-1">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                    roleClass
                  )}
                >
                  {data.role}
                </span>
                {manage ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setRenameOpen(true)}
                          aria-label="Rename workspace"
                        />
                      }
                    >
                      <Pencil className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top">Rename workspace</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Your team&apos;s shared home in TeamHub
            </p>
          </div>
        </div>

        {/* Owner / admin only — members still see the Members row below */}
        {canInvite ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
            <Link
              href={membersHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-9"
              )}
            >
              <Users data-icon="inline-start" />
              Manage
            </Link>
            <Button
              type="button"
              size="lg"
              className="h-9"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus data-icon="inline-start" />
              Send invite
            </Button>
          </div>
        ) : manage ? (
          <Link
            href={membersHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-9"
            )}
          >
            <Users data-icon="inline-start" />
            Manage
          </Link>
        ) : null}
      </header>

      {/* Everyone can open members (read-only for role=member) */}
      <Link
        href={membersHref}
        className="mt-8 flex w-full items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="flex -space-x-2" aria-hidden>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-2 border-card text-xs font-semibold text-white",
              workspaceTileColor(data.name)
            )}
          >
            {workspaceInitials(data.name).slice(0, 1)}
          </div>
          <div className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
            +
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Members</p>
          <p className="text-xs text-muted-foreground">
            {manage
              ? emailVerified
                ? "View teammates and invite by email"
                : "View teammates — verify email to send invites"
              : "View people in this workspace"}
          </p>
        </div>

        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={2}
        />
      </Link>

      <Link
        href={channelsHref}
        className="mt-4 flex w-full items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden
        >
          <Hash className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Channels</p>
          <p className="text-xs text-muted-foreground">
            Team chat — open #general and create topic channels
          </p>
        </div>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={2}
        />
      </Link>

      {/* Danger zone — leave (everyone) · delete (owner only) */}
      <div className="mt-10 space-y-6 border-t border-border pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Leave workspace
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Remove yourself from{" "}
              <OverflowText
                variant="ellipsis"
                className="inline-block max-w-[min(100%,14rem)] align-bottom font-medium text-foreground"
              >
                {data.name}
              </OverflowText>
              . You can rejoin if invited again.
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-9 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setLeaveOpen(true)}
                />
              }
            >
              <LogOut data-icon="inline-start" />
              Leave
            </TooltipTrigger>
            <TooltipContent side="top">
              Leave this workspace. Sole owners must transfer or delete first.
            </TooltipContent>
          </Tooltip>
        </div>

        {isOwner ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Delete workspace
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Permanently remove{" "}
                <OverflowText
                  variant="ellipsis"
                  className="inline-block max-w-[min(100%,14rem)] align-bottom font-medium text-foreground"
                >
                  {data.name}
                </OverflowText>{" "}
                for everyone. Cannot be undone.
              </p>
            </div>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-9 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  />
                }
              >
                <Trash2 data-icon="inline-start" />
                Delete
              </TooltipTrigger>
              <TooltipContent side="top">
                Deletes the workspace and removes all members. No email notify.
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>

      {canInvite ? (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          workspaceId={workspaceId}
        />
      ) : null}

      {manage ? (
        <RenameWorkspaceDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          workspaceId={workspaceId}
          currentName={data.name}
        />
      ) : null}

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave workspace?"
        description={
          <>
            You’ll lose access to{" "}
            <OverflowText
              variant="ellipsis"
              className="inline-block max-w-[min(100%,16rem)] align-bottom font-medium text-foreground"
            >
              {data.name}
            </OverflowText>
            . An owner or admin can invite you again later.
          </>
        }
        icon={LogOut}
        variant="destructive"
        confirmLabel="Leave workspace"
        loadingLabel="Leaving…"
        onConfirm={onLeaveConfirm}
      />

      {isOwner ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete workspace?"
          description={
            <>
              This permanently removes{" "}
              <OverflowText
                variant="ellipsis"
                className="inline-block max-w-[min(100%,16rem)] align-bottom font-medium text-foreground"
              >
                {data.name}
              </OverflowText>{" "}
              for everyone. All members lose access. This cannot be undone.
            </>
          }
          icon={Trash2}
          variant="destructive"
          confirmLabel="Delete workspace"
          loadingLabel="Deleting…"
          onConfirm={onDeleteConfirm}
        />
      ) : null}
    </section>
  )
}
