"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Hash } from "lucide-react"

import ChannelEmptyTip from "@/components/channel/channel-empty-tip"
import ChannelMembersPanel from "@/components/channel/channel-members-panel"
import ChannelSidebar from "@/components/channel/channel-sidebar"
import ChannelAiPanel from "@/components/channel/ai/channel-ai-panel"
import ExplainMessageDialog from "@/components/channel/ai/explain-message-dialog"
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
  const [aiOpen, setAiOpen] = useState(false)
  const [explainTarget, setExplainTarget] = useState<{
    id: string
    body: string
    authorName: string
    attachmentNames: string[]
  } | null>(null)
  const [draftNonce, setDraftNonce] = useState(0)
  const [draftText, setDraftText] = useState("")
  const [forChannelId, setForChannelId] = useState(activeChannel?.id)

  const isPrivate = activeChannel?.visibility === "private"

  // Reset panels when switching channels. Members stay closed by default so
  // tablet/phone chat isn’t covered by the overlay (open via header).
  if (forChannelId !== activeChannel?.id) {
    setForChannelId(activeChannel?.id)
    setMembersOpen(false)
  }

  const showMembers = Boolean(membersOpen && isPrivate)

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden border-border bg-background md:border-l">
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
            <div className="bg-brand-wash flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
              <span
                className="brand-tile flex size-11 items-center justify-center rounded-[var(--radius)]"
                aria-hidden
              >
                <Hash className="size-5" strokeWidth={1.5} />
              </span>
              Select a channel to start chatting
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
              backHref={`/workspace/${workspaceId}/channels`}
              onRename={() => setRenameOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              onInvite={isPrivate ? () => setInviteOpen(true) : undefined}
              onToggleMembers={
                isPrivate ? () => setMembersOpen((v) => !v) : undefined
              }
              onOpenAi={() => setAiOpen(true)}
            />
            <ReconnectBanner visible={reconnecting} />
            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={messagesLoading}
              isError={messagesError}
              onExplainMessage={(target) => setExplainTarget(target)}
            />
            <TypingIndicator label={typingLabel} />
            <ChatComposer
              channelName={activeChannel.name}
              onSend={onSendMessage}
              onTyping={onTyping}
              isSending={isSending}
              draftNonce={draftNonce}
              draftText={draftText}
            />
          </>
        )}
      </div>

      {showMembers ? (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/30 lg:hidden"
            aria-label="Close members"
            onClick={() => setMembersOpen(false)}
          />
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
        </>
      ) : null}

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreateChannel}
      />

      {activeChannel ? (
        <>
          <ChannelAiPanel
            open={aiOpen}
            onOpenChange={setAiOpen}
            workspaceId={workspaceId}
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            onInsertDraft={(text) => {
              setDraftText(text)
              setDraftNonce((n) => n + 1)
            }}
          />
          <ExplainMessageDialog
            open={explainTarget != null}
            onOpenChange={(open) => {
              if (!open) setExplainTarget(null)
            }}
            workspaceId={workspaceId}
            channelId={activeChannel.id}
            target={explainTarget}
          />
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
