"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Hash, SearchX } from "lucide-react"
import { toast } from "sonner"

import ChannelChatShell, {
  useChannelRouteIds,
} from "@/components/channel/channel-chat-shell"
import Loader from "@/components/sharable/loader"
import { buttonVariants } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { ChannelVisibilityEnum } from "@/lib/types/channel/channel-types"
import { MembershipRole } from "@/lib/types/workspace/workspace-types"
import { cn } from "@/lib/utils"
import {
  useAddChannelMembersMutation,
  useCreateChannelMutation,
  useCreateMessageMutation,
  useDeleteChannelMutation,
  useGetChannelMembersQuery,
  useGetChannelsQuery,
  useGetMessagesQuery,
  useRemoveChannelMemberMutation,
  useUpdateChannelMutation,
} from "@/store/api/channel/channel-api"
import {
  useGetWorkspaceByIdQuery,
  useGetWorkspaceMembersQuery,
} from "@/store/api/workspace/workspaces-api"
import {
  useChannelRealtime,
  MESSAGE_PAGE_LIMIT,
} from "@/hooks/channels/use-channel-realtime"
import { useChannelTyping } from "@/hooks/channels/use-channel-typing"
import { useWorkspacePresence } from "@/hooks/workspace/user-workspace-presence"
import { useRef, useEffect } from "react"
import { useSocket } from "@/components/providers/socket-provider"

/**
 * Chat page — channels + messages RTK + live socket (T16) + typing (T17).
 */
export default function ChannelChatPage() {
  const router = useRouter()
  const { workspaceId, channelId } = useChannelRouteIds()
  const { socket } = useSocket()
  const { user } = useCurrentUser()
  const currentUserId = user?.id ?? ""

  const {
    data: channelsData,
    isLoading: isChannelsLoading,
    isError: isChannelsError,
  } = useGetChannelsQuery({ workspaceId }, { skip: !workspaceId })

  const channels = channelsData?.channels ?? []
  const activeChannel =
    channels.find((channel) => channel.id === channelId) ?? null
  const isPrivate = activeChannel?.visibility === ChannelVisibilityEnum.Private

  const realtimeEnabled = Boolean(workspaceId && channelId && activeChannel)

  const { reconnecting } = useChannelRealtime({
    workspaceId,
    channelId,
    enabled: realtimeEnabled,
  })

  const { typingLabel } = useChannelTyping({
    channelId,
    currentUserId,
    enabled: realtimeEnabled,
  })

  // Workspace-wide online set → drives m.online dots + header count
  const { isOnline } = useWorkspacePresence({
    workspaceId,
    enabled: Boolean(workspaceId),
  })

  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useGetWorkspaceByIdQuery({ workspaceId }, { skip: !workspaceId })

  // History for the open channel (skip until ids exist; list shows its own loader)
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
  } = useGetMessagesQuery(
    { workspaceId, channelId, limit: MESSAGE_PAGE_LIMIT },
    { skip: !workspaceId || !channelId }
  )

  // Private only — public channels do not use ChannelMembership
  const {
    data: channelMembersData,
    isLoading: isChannelMembersLoading,
    isError: isChannelMembersError,
  } = useGetChannelMembersQuery(
    { workspaceId, channelId },
    { skip: !workspaceId || !channelId || !isPrivate }
  )

  // Invite picker needs workspace roster − channel members (private + manage)
  const {
    data: workspaceMembersData,
    isLoading: isWorkspaceMembersLoading,
    isError: isWorkspaceMembersError,
  } = useGetWorkspaceMembersQuery(
    { workspaceId },
    { skip: !workspaceId || !isPrivate }
  )

  const channelMembers = (channelMembersData?.members ?? []).map((m) => {
    return {
      ...m,
      online: isOnline(m.userId),
    }
  })

  const workspaceMembers = workspaceMembersData?.members ?? []

  const channelMemberIds = new Set(channelMembers.map((m) => m.userId))
  const inviteCandidates = workspaceMembers
    .filter(
      (m) => !channelMemberIds.has(m.userId) && m.userId !== currentUserId
    )
    .map((m) => ({
      userId: m.userId,
      fullName: m.fullName,
      email: m.email,
    }))

  const [createMessage, { isLoading: isSending }] = useCreateMessageMutation()
  const [createChannel] = useCreateChannelMutation()
  const [updateChannel] = useUpdateChannelMutation()
  const [deleteChannel] = useDeleteChannelMutation()
  const [addChannelMembers] = useAddChannelMembersMutation()
  const [removeChannelMember] = useRemoveChannelMemberMutation()

  const lastTypingEmit = useRef(0)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /** Stop typing immediately. after send message */
  function stopTyping(): void {
    clearTimeout(stopTimer.current)
    stopTimer.current = undefined
    lastTypingEmit.current = 0
    socket?.emit("typing:stop", { channelId })
  }

  /** Throttle start (~1.5s); idle 3s → stop. Payload is channelId only. */
  function onTyping(): void {
    const now = Date.now()

    if (now - lastTypingEmit.current >= 1500) {
      socket?.emit("typing:start", { channelId })
      lastTypingEmit.current = now
    }

    clearTimeout(stopTimer.current)
    stopTimer.current = setTimeout(() => {
      socket?.emit("typing:stop", { channelId })
      lastTypingEmit.current = 0
    }, 3000)
  }

  // Channel switch: clear idle timer + tell peers we stopped on the old channel
  useEffect(() => {
    return () => {
      clearTimeout(stopTimer.current)
      stopTimer.current = undefined
      lastTypingEmit.current = 0
      socket?.emit("typing:stop", { channelId })
    }
  }, [channelId, socket])

  const role = workspaceData?.role?.toLowerCase()
  const canManage =
    role === MembershipRole.Owner || role === MembershipRole.Admin

  const waitingOnPrivateExtras =
    isPrivate && (isChannelMembersLoading || isWorkspaceMembersLoading)

  if (
    !workspaceId ||
    isChannelsLoading ||
    isWorkspaceLoading ||
    waitingOnPrivateExtras
  ) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader fullPage />
      </div>
    )
  }

  if (isChannelsError || isWorkspaceError) {
    return (
      <ChannelStatus
        title="Couldn’t load channels"
        description="Something went wrong. Go back to the workspace and try again."
        href={`/workspace/${workspaceId || ""}`}
        hrefLabel="Back to workspace"
      />
    )
  }

  if (isPrivate && (isChannelMembersError || isWorkspaceMembersError)) {
    return (
      <ChannelStatus
        title="Couldn’t load channel members"
        description="Private channel member data failed to load. Try again."
        href={`/workspace/${workspaceId}/channels`}
        hrefLabel="Back to channels"
      />
    )
  }

  // Not in list = missing, wrong workspace, or private without membership (API 404 shape)
  if (!activeChannel) {
    return (
      <ChannelStatus
        icon="search"
        title="Channel not found"
        description="This channel doesn’t exist, or you don’t have access to it."
        href={`/workspace/${workspaceId}/channels`}
        hrefLabel="Back to channels"
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ChannelChatShell
        workspaceId={workspaceId}
        channels={channels}
        activeChannel={activeChannel}
        messages={messagesData?.messages ?? []}
        messagesLoading={isMessagesLoading}
        messagesError={isMessagesError}
        channelMembers={channelMembers}
        inviteCandidates={inviteCandidates}
        currentUserId={currentUserId}
        canManage={canManage}
        reconnecting={reconnecting}
        typingLabel={typingLabel}
        onTyping={onTyping}
        isSending={isSending}
        onCreateChannel={async (data) => {
          try {
            const created = await createChannel({
              workspaceId,
              name: data.name,
              visibility: data.visibility,
            }).unwrap()
            toast.success(`Created #${created.name}`)
            router.push(`/workspace/${workspaceId}/channels/${created.id}`)
          } catch {
            toast.error("Could not create channel")
            throw new Error("create failed")
          }
        }}
        onRenameChannel={async (data) => {
          try {
            await updateChannel({
              workspaceId,
              channelId,
              name: data.name,
            }).unwrap()
            toast.success("Channel renamed")
          } catch {
            toast.error("Could not rename channel")
            throw new Error("rename failed")
          }
        }}
        onDeleteChannel={async () => {
          try {
            await deleteChannel({ workspaceId, channelId }).unwrap()
            toast.success("Channel deleted")
            router.replace(`/workspace/${workspaceId}/channels`)
          } catch {
            toast.error("Could not delete channel")
            throw new Error("delete failed")
          }
        }}
        onInviteMembers={async (userIds) => {
          try {
            const result = await addChannelMembers({
              workspaceId,
              channelId,
              userIds,
            }).unwrap()

            if (result.added.length > 0) {
              toast.success(
                `Added ${result.added.length} member${result.added.length === 1 ? "" : "s"}`
              )
            }
            if (result.failed.length > 0) {
              toast.error(
                `Could not add ${result.failed.length}: ${result.failed.map((f) => f.reason).join(", ")}`
              )
            }
            // Keep dialog open if nothing was added
            if (result.added.length === 0) {
              throw new Error("invite failed")
            }
          } catch (err) {
            if (err instanceof Error && err.message === "invite failed") {
              throw err
            }
            toast.error("Could not invite members")
            throw new Error("invite failed")
          }
        }}
        onRemoveMember={async (memberUserId) => {
          try {
            await removeChannelMember({
              workspaceId,
              channelId,
              userId: memberUserId,
            }).unwrap()
            toast.success("Member removed")
          } catch {
            toast.error("Could not remove member")
            throw new Error("remove failed")
          }
        }}
        onSendMessage={async ({ body, files }) => {
          // T12 text-only — S3 later
          if (files.length > 0) {
            toast.message("File uploads come later")
          }
          const text = body.trim()
          if (!text) {
            toast.error("Type a message to send")
            throw new Error("empty")
          }
          try {
            await createMessage({
              workspaceId,
              channelId,
              body: text,
              clientMessageId: crypto.randomUUID(),
            }).unwrap()
            // Clear typing so peers don't keep seeing you after send
            stopTyping()
          } catch {
            toast.error("Could not send message")
            throw new Error("send failed") // composer keeps draft
          }
        }}
      />
    </div>
  )
}

function ChannelStatus({
  title,
  description,
  href,
  hrefLabel,
  icon = "hash",
}: {
  title: string
  description: string
  href: string
  hrefLabel: string
  icon?: "hash" | "search"
}) {
  const Icon = icon === "search" ? SearchX : Hash

  return (
    <section className="bg-brand-wash flex h-full flex-1 flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div
          className={cn(
            "mb-6 flex size-16 items-center justify-center rounded-[var(--radius)]",
            icon === "search"
              ? "border border-border bg-card text-muted-foreground"
              : "brand-tile"
          )}
          aria-hidden
        >
          <Icon className="size-8" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <Link
          href={href}
          className={cn(buttonVariants({ size: "lg" }), "mt-8 h-10 px-5")}
        >
          {hrefLabel}
        </Link>
      </div>
    </section>
  )
}
