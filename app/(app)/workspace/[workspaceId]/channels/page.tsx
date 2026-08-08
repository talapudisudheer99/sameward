"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Hash } from "lucide-react"

import Loader from "@/components/sharable/loader"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGetChannelsQuery } from "@/store/api/channel/channel-api"

/**
 * Channels index — traffic director, not the chat UI.
 *
 * Job: decide WHICH channel to open, then leave.
 *   GET channels → prefer isDefault (#general) → else first →
 *   replace → /workspace/:id/channels/:channelId (real chat lives there).
 *
 * States: loading spinner · error · empty · success = keep spinner while redirecting.
 */
export default function ChannelsIndexPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : ""

  // skip until we have an id from the URL (avoids a useless request)
  const { data, isLoading, isError } = useGetChannelsQuery(
    { workspaceId },
    { skip: !workspaceId }
  )

  // API body is { channels: [...] } — pull the list out once for clear use below
  const channels = data?.channels

  // When the list arrives, jump into the best channel (replace = no back-button trap)
  useEffect(() => {
    if (!workspaceId || !channels?.length) return

    const defaultChannel = channels.find((channel) => channel.isDefault)
    const target = defaultChannel ?? channels[0]

    router.replace(`/workspace/${workspaceId}/channels/${target.id}`)
  }, [router, workspaceId, channels])

  if (!workspaceId || isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader fullPage />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-brand-wash flex h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground"
          aria-hidden
        >
          <Hash className="size-6" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-xl font-semibold">
          Couldn’t load channels
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Something went wrong. Go back and try again.
        </p>
        <Link
          href={`/workspace/${workspaceId}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to workspace
        </Link>
      </div>
    )
  }

  if (!channels || channels.length === 0) {
    return (
      <div className="bg-brand-wash flex h-full flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <div
          className="brand-tile flex size-12 items-center justify-center rounded-[var(--radius)]"
          aria-hidden
        >
          <Hash className="size-6" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-xl font-semibold">No channels yet</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This workspace doesn’t have any channels you can open.
        </p>
        <Link
          href={`/workspace/${workspaceId}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to workspace
        </Link>
      </div>
    )
  }

  // List is ready; useEffect is navigating — spinner avoids a blank flash
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <Loader fullPage />
    </div>
  )
}
