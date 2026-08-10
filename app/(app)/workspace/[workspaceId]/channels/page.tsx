"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Hash, Lock } from "lucide-react"

import Loader from "@/components/sharable/loader"
import OverflowText from "@/components/sharable/overflow-text"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGetChannelsQuery } from "@/store/api/channel/channel-api"

/**
 * Channels index — two jobs:
 *
 * Desktop (md+): traffic director → jump into default/first channel.
 * Phone / `?list=1`: channel picker (chat hides the sidebar; Back lands here).
 */
export default function ChannelsIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-1 items-center justify-center">
          <Loader fullPage />
        </div>
      }
    >
      <ChannelsIndexInner />
    </Suspense>
  )
}

function ChannelsIndexInner() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : ""
  const forceList = searchParams.get("list") === "1"

  const [isNarrow, setIsNarrow] = useState(false)

  const { data, isLoading, isError } = useGetChannelsQuery(
    { workspaceId },
    { skip: !workspaceId }
  )

  const channels = data?.channels

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Desktop entry: auto-open a channel. Skip when picking (mobile / ?list=1).
  useEffect(() => {
    if (!workspaceId || !channels?.length || forceList || isNarrow) return

    const defaultChannel = channels.find((channel) => channel.isDefault)
    const target = defaultChannel ?? channels[0]
    if (!target) return
    router.replace(`/workspace/${workspaceId}/channels/${target.id}`)
  }, [router, workspaceId, channels, forceList, isNarrow])

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

  // Phone, or Back from chat (?list=1): full-screen channel picker
  if (forceList || isNarrow) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col bg-card">
        <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
          <Link
            href={`/workspace/${workspaceId}`}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back to workspace"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="font-heading text-base font-semibold tracking-tight">
            Channels
          </h1>
        </header>
        <nav
          className="min-h-0 flex-1 overflow-y-auto p-2"
          aria-label="Channels"
        >
          <ul className="flex flex-col gap-0.5">
            {channels.map((ch) => {
              const Icon = ch.visibility === "private" ? Lock : Hash
              return (
                <li key={ch.id} className="min-w-0">
                  <Link
                    href={`/workspace/${workspaceId}/channels/${ch.id}`}
                    className="flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Icon
                      className="size-3.5 shrink-0 opacity-70"
                      aria-hidden
                    />
                    <OverflowText className="min-w-0 flex-1 font-medium">
                      {ch.name}
                    </OverflowText>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    )
  }

  // Desktop: list ready, effect is navigating
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <Loader fullPage />
    </div>
  )
}
