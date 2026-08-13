"use client"

import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  LogIn,
  SearchX,
  UserRoundX,
  Users,
} from "lucide-react"

import {
  workspaceInitials,
} from "@/components/workspace/workspace-display"
import OverflowText from "@/components/sharable/overflow-text"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { InvitePreview } from "@/lib/types/workspace/workspace-types"

export type { InvitePreview }

export type AcceptInviteViewState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "expired" }
  | { kind: "accepted" }
  | { kind: "error"; message: string }
  | {
      kind: "needs_login"
      invite: InvitePreview
      loginHref: string
    }
  | {
      kind: "wrong_user"
      invite: InvitePreview
      currentEmail: string
      onSwitchAccount: () => void
      isSwitching?: boolean
    }
  | {
      kind: "ready"
      invite: InvitePreview
      isAccepting: boolean
      acceptError?: string
      onAccept: () => void
    }

type AcceptInviteCardProps = {
  state: AcceptInviteViewState
}

/**
 * Presentational accept-invite UI.
 * Page owns RTK / auth; this only renders states.
 */
export default function AcceptInviteCard({ state }: AcceptInviteCardProps) {
  if (state.kind === "loading") {
    return null
  }

  if (state.kind === "not_found") {
    return (
      <InviteShell
        icon={
          <StatusTile tone="neutral">
            <SearchX className="size-8" strokeWidth={1.5} />
          </StatusTile>
        }
        title="Invite not found"
        description="This link is invalid or no longer exists. Ask your teammate to send a new invite."
        actions={
          <Link
            href="/workspace"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Go to Workspaces
          </Link>
        }
      />
    )
  }

  if (state.kind === "expired") {
    return (
      <InviteShell
        icon={
          <StatusTile tone="brand">
            <Clock className="size-8" strokeWidth={1.5} />
          </StatusTile>
        }
        title="Invite expired"
        description="This invite link has expired. Ask the workspace owner or admin to send a new one."
        actions={
          <Link
            href="/workspace"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Go to Workspaces
          </Link>
        }
      />
    )
  }

  if (state.kind === "accepted") {
    return (
      <InviteShell
        icon={
          <StatusTile tone="brand">
            <CheckCircle2 className="size-8" strokeWidth={1.5} />
          </StatusTile>
        }
        title="Invite already used"
        description="This invite was already accepted. If you’re a member, open the workspace from your list."
        actions={
          <Link
            href="/workspace"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Go to Workspaces
          </Link>
        }
      />
    )
  }

  if (state.kind === "error") {
    return (
      <InviteShell
        icon={
          <StatusTile tone="neutral">
            <SearchX className="size-8" strokeWidth={1.5} />
          </StatusTile>
        }
        title="Something went wrong"
        description={state.message}
        actions={
          <Link
            href="/workspace"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Go to Workspaces
          </Link>
        }
      />
    )
  }

  const { invite } = state
  const tile = (
    <div
      className="brand-tile mb-6 flex size-16 items-center justify-center rounded-[var(--radius)] font-heading text-lg font-semibold tracking-tight"
      aria-hidden
    >
      {workspaceInitials(invite.workspaceName)}
    </div>
  )

  if (state.kind === "needs_login") {
    return (
      <InviteShell
        icon={tile}
        title={
          <>
            Join{" "}
            <OverflowText as="span" variant="title" className="inline">
              {invite.workspaceName}
            </OverflowText>
          </>
        }
        description={`You’ve been invited as ${invite.email}. Sign in with that account to accept.`}
        actions={
          <Link
            href={state.loginHref}
            className={cn(buttonVariants({ size: "lg" }), "h-10 gap-2 px-5")}
          >
            <LogIn className="size-4" />
            Sign in to accept
          </Link>
        }
      />
    )
  }

  if (state.kind === "wrong_user") {
    return (
      <InviteShell
        icon={
          <StatusTile tone="neutral">
            <UserRoundX className="size-8" strokeWidth={1.5} />
          </StatusTile>
        }
        title="Wrong account"
        description={`This invite is for ${invite.email}, but you’re signed in as ${state.currentEmail}. Sign out and sign in with the invited email.`}
        actions={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-10 px-5"
              disabled={state.isSwitching}
              onClick={state.onSwitchAccount}
            >
              {state.isSwitching
                ? "Switching…"
                : `Sign in as ${invite.email}`}
            </Button>
            <Link
              href="/workspace"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-10 px-5"
              )}
            >
              Back to Workspaces
            </Link>
          </div>
        }
      />
    )
  }

  // ready
  return (
    <InviteShell
      icon={tile}
      title={
        <>
          Join{" "}
          <OverflowText as="span" variant="title" className="inline">
            {invite.workspaceName}
          </OverflowText>
        </>
      }
      description={`You’re invited as ${invite.email}. Accept to become a member of this workspace.`}
      actions={
        <div className="flex w-full max-w-xs flex-col items-stretch gap-3">
          {state.acceptError ? (
            <p role="alert" className="text-center text-sm text-destructive">
              {state.acceptError}
            </p>
          ) : null}
          <Button
            size="lg"
            className="h-10 gap-2"
            disabled={state.isAccepting}
            onClick={state.onAccept}
          >
            <Users className="size-4" />
            {state.isAccepting ? "Accepting…" : "Accept invite"}
          </Button>
        </div>
      }
    />
  )
}

/** Consistent icon tile for invite status states. */
function StatusTile({
  tone,
  children,
}: {
  tone: "brand" | "neutral"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mb-6 flex size-16 items-center justify-center rounded-[var(--radius)]",
        tone === "brand"
          ? "brand-tile"
          : "border border-border bg-card text-muted-foreground"
      )}
      aria-hidden
    >
      {children}
    </div>
  )
}

function InviteShell({
  icon,
  title,
  description,
  actions,
}: {
  icon: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  actions: React.ReactNode
}) {
  return (
    <section className="flex w-full max-w-md flex-col items-center text-center">
      {icon}
      <h1 className="w-full font-heading text-2xl font-bold tracking-tight [overflow-wrap:anywhere] break-words text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 w-full text-sm leading-relaxed [overflow-wrap:anywhere] break-words text-muted-foreground md:text-base">
        {description}
      </p>
      <div className="mt-8 flex w-full justify-center">{actions}</div>
    </section>
  )
}
