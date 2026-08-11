"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Hash, Lock, MessageSquare, Plus } from "lucide-react"
import { toast } from "sonner"

import StartDmDialog from "@/components/dialogs/channel/start-dm-dialog"
import Loader from "@/components/sharable/loader"
import OverflowText from "@/components/sharable/overflow-text"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { cn } from "@/lib/utils"
import {
  useGetChannelsQuery,
  useGetDmsQuery,
  useOpenDmMutation,
} from "@/store/api/channel/channel-api"
import { useGetWorkspaceMembersQuery } from "@/store/api/workspace/workspaces-api"

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

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  const badge = count > 99 ? "99+" : String(count)
  return (
    <span className="ml-auto shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums">
      {badge}
    </span>
  )
}

function ChannelsIndexInner() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : ""
  const forceList = searchParams.get("list") === "1"
  const { user } = useCurrentUser()
  const currentUserId = user?.id ?? ""

  const [isNarrow, setIsNarrow] = useState(false)
  const [dmOpen, setDmOpen] = useState(false)

  const { data, isLoading, isError } = useGetChannelsQuery(
    { workspaceId },
    { skip: !workspaceId }
  )
  const { data: dmsData } = useGetDmsQuery(
    { workspaceId },
    { skip: !workspaceId }
  )
  const { data: membersData } = useGetWorkspaceMembersQuery(
    { workspaceId },
    {
      skip: !workspaceId || !(forceList || isNarrow),
    }
  )
  const [openDm, { isLoading: isOpeningDm }] = useOpenDmMutation()

  const channels = data?.channels
  const dms = dmsData?.dms ?? []
  const dmCandidates = (membersData?.members ?? [])
    .filter((m) => m.userId !== currentUserId)
    .map((m) => ({
      userId: m.userId,
      fullName: m.fullName,
      email: m.email,
    }))

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

  async function handleOpenDm(peerUserId: string) {
    try {
      const dm = await openDm({ workspaceId, userId: peerUserId }).unwrap()
      router.push(`/workspace/${workspaceId}/channels/${dm.id}`)
    } catch {
      toast.error("Couldn’t open direct message")
      throw new Error("open_dm_failed")
    }
  }

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
              const unread = (ch.unreadCount ?? 0) > 0
              return (
                <li key={ch.id} className="min-w-0">
                  <Link
                    href={`/workspace/${workspaceId}/channels/${ch.id}`}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                      unread
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    )}
                    aria-label={
                      unread
                        ? `${ch.name}, ${ch.unreadCount > 99 ? "99+" : ch.unreadCount} unread`
                        : ch.name
                    }
                  >
                    <Icon
                      className="size-3.5 shrink-0 opacity-70"
                      aria-hidden
                    />
                    <OverflowText className="min-w-0 flex-1 font-medium">
                      {ch.name}
                    </OverflowText>
                    <UnreadBadge count={unread ? ch.unreadCount : 0} />
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-2 px-3 pt-2">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Direct messages
            </p>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-7 text-primary"
              onClick={() => setDmOpen(true)}
              aria-label="New direct message"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          {dms.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Message a teammate privately.
            </p>
          ) : (
            <ul className="mt-1 flex flex-col gap-0.5">
              {dms.map((dm) => {
                const unread = dm.unreadCount > 0
                return (
                  <li key={dm.id} className="min-w-0">
                    <Link
                      href={`/workspace/${workspaceId}/channels/${dm.id}`}
                      className={cn(
                        "flex min-w-0 items-center gap-2 rounded-[var(--radius)] px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                        unread
                          ? "font-semibold text-foreground"
                          : "text-foreground"
                      )}
                      aria-label={
                        unread
                          ? `${dm.peer.fullName}, ${dm.unreadCount > 99 ? "99+" : dm.unreadCount} unread`
                          : dm.peer.fullName
                      }
                    >
                      <MessageSquare
                        className="size-3.5 shrink-0 opacity-70"
                        aria-hidden
                      />
                      <OverflowText className="min-w-0 flex-1 font-medium">
                        {dm.peer.fullName}
                      </OverflowText>
                      <UnreadBadge count={unread ? dm.unreadCount : 0} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>

        <StartDmDialog
          open={dmOpen}
          onOpenChange={setDmOpen}
          candidates={dmCandidates}
          onSelect={handleOpenDm}
          isSubmitting={isOpeningDm}
        />
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
