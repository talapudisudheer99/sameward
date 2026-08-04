"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import ChannelEmptyTip from "@/components/channel/channel-empty-tip"
import ChannelMembersPanel from "@/components/channel/channel-members-panel"
import ChannelSidebar from "@/components/channel/channel-sidebar"
import ChatComposer from "@/components/channel/chat-composer"
import ChatHeader from "@/components/channel/chat-header"
import ChatMessageList from "@/components/channel/chat-message-list"
import ReconnectBanner from "@/components/channel/reconnect-banner"
import TypingIndicator from "@/components/channel/typing-indicator"
import type {
  ChannelListItem,
  ChannelMemberRow,
  ChatMessage,
} from "@/lib/types/channel/channel-types"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"
import ConfirmDialog from "@/components/dialogs/confirm-dialog"
import CreateChannelDialog from "@/components/dialogs/channel/create-channel-dialog"
import InviteChannelMembersDialog from "@/components/dialogs/channel/invite-channel-members-dialog"
import RenameChannelDialog from "@/components/dialogs/channel/rename-channel-dialog"

/**
 * Presentational chat shell — all data via props.
 * Page / RTK layer fills props and implements callbacks.
 */
export type ChannelChatShellProps = {
  workspaceId: string
  channels: ChannelListItem[]
  activeChannel: ChannelListItem | null
  messages: ChatMessage[]
  /** History query — list shows spinner / error without blocking the shell */
  messagesLoading?: boolean
  messagesError?: boolean
  channelMembers: ChannelMemberRow[]
  /** For invite dialog — workspace members not already in channel */
  inviteCandidates: WorkspaceMemberOption[]
  currentUserId: string
  canManage: boolean
  reconnecting?: boolean
  typingLabel?: string | null
  /** Disable composer while createMessage is in flight */
  isSending?: boolean
  /** RTK callbacks — throw/reject on failure */
  onCreateChannel: (data: {
    name: string
    visibility: "public" | "private"
  }) => Promise<void>
  onRenameChannel: (data: { name: string }) => Promise<void>
  onDeleteChannel: () => Promise<void>
  onInviteMembers: (userIds: string[]) => Promise<void>
  onRemoveMember?: (userId: string) => Promise<void>
  onSendMessage: (payload: { body: string; files: File[] }) => Promise<void>
  onTyping?: () => void
}

export default function ChannelChatShell({
  workspaceId,
  channels,
  activeChannel,
  messages,
  messagesLoading = false,
  messagesError = false,
  channelMembers,
  inviteCandidates,
  currentUserId,
  canManage,
  reconnecting = false,
  typingLabel = null,
  isSending = false,
  onCreateChannel,
  onRenameChannel,
  onDeleteChannel,
  onInviteMembers,
  onRemoveMember,
  onSendMessage,
  onTyping,
}: ChannelChatShellProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)

  const isPrivate = activeChannel?.visibility === "private"

  useEffect(() => {
    // Default open members strip for private; reset when switching channels
    setMembersOpen(activeChannel?.visibility === "private")
  }, [activeChannel?.id, activeChannel?.visibility])

  const showMembers = Boolean(membersOpen && isPrivate)

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden border-border bg-background md:border-l">
      <ChannelSidebar
        workspaceId={workspaceId}
        channels={channels}
        activeChannelId={activeChannel?.id}
        canCreate={canManage}
        onCreateClick={() => setCreateOpen(true)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!activeChannel ? (
          channels.length === 0 ? (
            <ChannelEmptyTip
              canCreate={canManage}
              onCreateClick={() => setCreateOpen(true)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a channel
            </div>
          )
        ) : (
          <>
            <ChatHeader
              channel={activeChannel}
              memberCount={isPrivate ? channelMembers.length : undefined}
              onlineCount={
                isPrivate
                  ? channelMembers.filter((m) => m.online).length || undefined
                  : undefined
              }
              canManage={canManage}
              onRename={() => setRenameOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onInvite={isPrivate ? () => setInviteOpen(true) : undefined}
              onToggleMembers={
                isPrivate ? () => setMembersOpen((v) => !v) : undefined
              }
            />
            <ReconnectBanner visible={reconnecting} />
            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={messagesLoading}
              isError={messagesError}
            />
            <TypingIndicator label={typingLabel} />
            <ChatComposer
              channelName={activeChannel.name}
              onSend={onSendMessage}
              onTyping={onTyping}
              isSending={isSending}
            />
          </>
        )}
      </div>

      {showMembers ? (
        <ChannelMembersPanel
          members={channelMembers}
          canInvite={canManage}
          onInvite={() => setInviteOpen(true)}
          onRemove={
            canManage && onRemoveMember
              ? (id) => void onRemoveMember(id)
              : undefined
          }
        />
      ) : null}

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreateChannel}
      />

      {activeChannel ? (
        <>
          <RenameChannelDialog
            open={renameOpen}
            onOpenChange={setRenameOpen}
            currentName={activeChannel.name}
            onRename={onRenameChannel}
          />
          <InviteChannelMembersDialog
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            channelName={activeChannel.name}
            candidates={inviteCandidates}
            onInvite={onInviteMembers}
          />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title="Delete channel?"
            description={`Delete #${activeChannel.name}? Messages in this channel will be removed.`}
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={onDeleteChannel}
          />
        </>
      ) : null}
    </div>
  )
}

/** Optional: page can read channelId from URL when wiring */
export function useChannelRouteIds() {
  const params = useParams()
  return {
    workspaceId:
      typeof params.workspaceId === "string" ? params.workspaceId : "",
    channelId: typeof params.channelId === "string" ? params.channelId : "",
  }
}
