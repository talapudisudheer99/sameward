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
  useDeleteMessageMutation,
  useGetChannelByIdQuery,
  useGetChannelMembersQuery,
  useGetChannelsQuery,
  useGetDmsQuery,
  useGetMessagesQuery,
  useMarkChannelReadMutation,
  useOpenDmMutation,
  useRemoveChannelMemberMutation,
  useUpdateChannelMutation,
  useUpdateMessageMutation,
  useToggleMessageReactionMutation,
} from "@/store/api/channel/channel-api"
import {
  useGetWorkspaceByIdQuery,
  useGetWorkspaceMembersQuery,
} from "@/store/api/workspace/workspaces-api"
import {
  useChannelRealtime,
  MESSAGE_PAGE_LIMIT,
} from "@/hooks/channels/use-channel-realtime"
import { useWorkspaceChannelActivity } from "@/hooks/channels/use-workspace-channel-activity"
import { useChannelTyping } from "@/hooks/channels/use-channel-typing"
import { useWorkspacePresence } from "@/hooks/workspace/user-workspace-presence"
import { useRef, useEffect, useState, useMemo } from "react"
import { useSocket } from "@/components/providers/socket-provider"
import { usePresignChannelUploadsMutation } from "@/store/api/upload/upload-api"
import { uploadFilesToS3 } from "@/lib/storage/upload-client"
import { dmListItemToChannel } from "@/lib/channels/chat-ui-helpers"

/**
 * Chat page — channels + DMs + messages RTK + live socket + typing.
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

  const {
    data: dmsData,
    isLoading: isDmsLoading,
    isError: isDmsError,
  } = useGetDmsQuery({ workspaceId }, { skip: !workspaceId })

  const channels = channelsData?.channels ?? []
  const dms = dmsData?.dms ?? []

  const dmAsChannel = useMemo(() => {
    const dm = dms.find((d) => d.id === channelId)
    return dm ? dmListItemToChannel(dm) : null
  }, [dms, channelId])

  const listedChannel =
    channels.find((channel) => channel.id === channelId) ?? dmAsChannel

  const { data: fetchedChannel, isLoading: isFetchingChannel } =
    useGetChannelByIdQuery(
      { workspaceId, channelId },
      {
        skip:
          !workspaceId ||
          !channelId ||
          Boolean(listedChannel) ||
          isChannelsLoading ||
          isDmsLoading,
      }
    )

  const activeChannel = listedChannel ?? fetchedChannel ?? null
  const isPrivate = activeChannel?.visibility === ChannelVisibilityEnum.Private

  const realtimeEnabled = Boolean(workspaceId && channelId && activeChannel)

  const { reconnecting } = useChannelRealtime({
    workspaceId,
    channelId,
    enabled: realtimeEnabled,
  })

  useWorkspaceChannelActivity({
    workspaceId,
    activeChannelId: channelId,
    currentUserId,
    enabled: Boolean(workspaceId && currentUserId),
  })

  const { typingLabel } = useChannelTyping({
    channelId,
    currentUserId,
    enabled: realtimeEnabled,
  })

  const { isOnline } = useWorkspacePresence({
    workspaceId,
    enabled: Boolean(workspaceId),
  })

  const [markChannelRead] = useMarkChannelReadMutation()
  const [openDm] = useOpenDmMutation()
  const [lastVisitByChannel, setLastVisitByChannel] = useState<
    Record<string, string | null>
  >({})
  const lastVisitSince = channelId
    ? (lastVisitByChannel[channelId] ?? null)
    : null

  useEffect(() => {
    if (!workspaceId || !channelId || !activeChannel) return

    let cancelled = false
    void (async () => {
      try {
        const result = await markChannelRead({
          workspaceId,
          channelId,
        }).unwrap()
        if (!cancelled) {
          setLastVisitByChannel((prev) => ({
            ...prev,
            [channelId]: result.previousLastReadAt,
          }))
        }
      } catch {
        if (!cancelled) {
          setLastVisitByChannel((prev) => ({
            ...prev,
            [channelId]: activeChannel.lastReadAt,
          }))
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot lastReadAt only on open
  }, [workspaceId, channelId, activeChannel?.id, markChannelRead])

  const {
    data: workspaceData,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
  } = useGetWorkspaceByIdQuery({ workspaceId }, { skip: !workspaceId })

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
  } = useGetMessagesQuery(
    { workspaceId, channelId, limit: MESSAGE_PAGE_LIMIT },
    { skip: !workspaceId || !channelId }
  )

  const {
    data: channelMembersData,
    isLoading: isChannelMembersLoading,
    isError: isChannelMembersError,
  } = useGetChannelMembersQuery(
    { workspaceId, channelId },
    { skip: !workspaceId || !channelId || !isPrivate }
  )

  const {
    data: workspaceMembersData,
    isLoading: isWorkspaceMembersLoading,
    isError: isWorkspaceMembersError,
  } = useGetWorkspaceMembersQuery({ workspaceId }, { skip: !workspaceId })

  const channelMembers = (channelMembersData?.members ?? []).map((m) => {
    return {
      ...m,
      online: isOnline(m.userId),
    }
  })

  const workspaceMembers = (workspaceMembersData?.members ?? []).map((m) => ({
    userId: m.userId,
    fullName: m.fullName,
    email: m.email,
  }))

  const channelMemberIds = new Set(channelMembers.map((m) => m.userId))
  const inviteCandidates = workspaceMembers.filter(
    (m) => !channelMemberIds.has(m.userId) && m.userId !== currentUserId
  )
  const [createMessage, { isLoading: isSending }] = useCreateMessageMutation()
  const [updateMessage] = useUpdateMessageMutation()
  const [deleteMessage] = useDeleteMessageMutation()
  const [toggleReaction] = useToggleMessageReactionMutation()
  const [presignUploads] = usePresignChannelUploadsMutation()
  const [isUploading, setIsUploading] = useState(false)
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
    isDmsLoading ||
    isWorkspaceLoading ||
    isWorkspaceMembersLoading ||
    waitingOnPrivateExtras ||
    (channelId && !listedChannel && isFetchingChannel)
  ) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader fullPage />
      </div>
    )
  }

  if (isChannelsError || isDmsError || isWorkspaceError || isWorkspaceMembersError) {
    return (
      <ChannelStatus
        title="Couldn’t load channels"
        description="Something went wrong. Go back to the workspace and try again."
        href={`/workspace/${workspaceId || ""}`}
        hrefLabel="Back to workspace"
      />
    )
  }

  if (isPrivate && isChannelMembersError) {
    return (
      <ChannelStatus
        title="Couldn’t load channel members"
        description="Private channel member data failed to load. Try again."
        href={`/workspace/${workspaceId}/channels`}
        hrefLabel="Back to channels"
      />
    )
  }

  // Not in list = missing, wrong workspace, or private/DM without access
  if (channelId && !activeChannel) {
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
        dms={dms}
        workspaceMembers={workspaceMembers}
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
        isSending={isSending || isUploading}
        lastVisitSince={lastVisitSince}
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
        onOpenDm={async (peerUserId) => {
          try {
            const dm = await openDm({
              workspaceId,
              userId: peerUserId,
            }).unwrap()
            router.push(`/workspace/${workspaceId}/channels/${dm.id}`)
          } catch {
            toast.error("Could not open direct message")
            throw new Error("dm failed")
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
        onSendMessage={async ({ body, files, mentionedUserIds }) => {
          const text = body.trim()
          if (!text && files.length === 0) {
            toast.error("Type a message or attach a file")
            throw new Error("empty")
          }

          try {
            // Lazy upload: presign + PUT to S3 only now, on Send.
            let attachments
            if (files.length > 0) {
              setIsUploading(true)
              try {
                const { uploads } = await presignUploads({
                  workspaceId,
                  channelId,
                  files: files.map((f) => ({
                    name: f.name,
                    mime: f.type,
                    sizeBytes: f.size,
                  })),
                }).unwrap()
                attachments = await uploadFilesToS3(uploads, files)
              } finally {
                setIsUploading(false)
              }
            }

            await createMessage({
              workspaceId,
              channelId,
              body: text,
              attachments,
              mentionedUserIds,
              clientMessageId: crypto.randomUUID(),
            }).unwrap()
            // Clear typing so peers don't keep seeing you after send
            stopTyping()
          } catch {
            toast.error("Could not send message")
            throw new Error("send failed") // composer keeps draft + files
          }
        }}
        onEditMessage={async (messageId, body) => {
          try {
            await updateMessage({
              workspaceId,
              channelId,
              messageId,
              body,
            }).unwrap()
            toast.success("Message updated")
          } catch {
            toast.error("Could not edit message")
            throw new Error("edit failed")
          }
        }}
        onDeleteMessage={async (messageId) => {
          try {
            await deleteMessage({
              workspaceId,
              channelId,
              messageId,
            }).unwrap()
            toast.success("Message deleted")
          } catch {
            toast.error("Could not delete message")
            throw new Error("delete failed")
          }
        }}
        onToggleReaction={async (messageId, emoji) => {
          try {
            await toggleReaction({
              workspaceId,
              channelId,
              messageId,
              emoji,
            }).unwrap()
          } catch {
            toast.error("Could not update reaction")
            throw new Error("reaction failed")
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
