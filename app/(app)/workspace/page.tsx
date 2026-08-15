"use client"

import { useState } from "react"
import Link from "next/link"
import { LayoutTemplate } from "lucide-react"

import CreateWorkSpaceDialog from "@/components/dialogs/workspace/create-work-space-dialog"
import Loader from "@/components/sharable/loader"
import WorkspaceList from "@/components/workspace/workspace-list"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGetWorkspacesQuery } from "@/store/api/workspace/workspaces-api"

export default function WorkspacePage() {
  const [open, setOpen] = useState(false)

  // RTK Query fires GET /api/workspaces on mount, caches, and auto-refetches
  // after createWorkspace invalidates the LIST tag.
  const { data, isLoading, isError, refetch, isFetching } =
    useGetWorkspacesQuery()

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <Loader fullPage />
  }

  if (isError) {
    return (
      <section className="bg-brand-wash flex min-h-[70vh] flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            Couldn’t load workspaces
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your connection, then try again.
          </p>
          <Button
            type="button"
            className="mt-6"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? "Retrying…" : "Try again"}
          </Button>
        </div>
      </section>
    )
  }

  const workspaces = data?.workspaces ?? []

  // ── Screen B — user has workspaces ────────────────────────────────────────
  if (workspaces.length > 0) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Workspaces
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Teams you belong to
            </p>
          </div>

          <CreateWorkSpaceDialog open={open} onOpenChange={setOpen} />
        </div>

        <WorkspaceList workspaces={workspaces} />
      </section>
    )
  }

  // ── Screen A — empty state ────────────────────────────────────────────────
  return (
    <section className="bg-brand-wash flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <div
          className="brand-tile mb-6 flex size-16 items-center justify-center rounded-[var(--radius)]"
          aria-hidden
        >
          <LayoutTemplate className="size-8" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Welcome to Sameward
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your team&apos;s conversations, easier to understand. Stay on the same
          page, catch up on what you missed, and see the context behind team
          discussions.
        </p>

        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <CreateWorkSpaceDialog open={open} onOpenChange={setOpen} />
          <Link
            href="/explore"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-10 px-4"
            )}
          >
            Explore Sameward
          </Link>
        </div>
      </div>
    </section>
  )
}
