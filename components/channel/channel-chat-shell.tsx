"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Hash } from "lucide-react"

import ChannelEmptyTip from "@/components/channel/channel-empty-tip"
import ChannelMembersPanel from "@/components/channel/channel-members-panel"
import ChannelSidebar from "@/components/channel/channel-sidebar"
import ChannelAiPanel from "@/components/channel/ai/channel-ai-panel"
import ExplainMessageDialog from "@/components/channel/ai/explain-message-dialog"
import ProfileCardDialog from "@/components/profile/profile-card-dialog"
import ChatComposer from "@/components/channel/chat-composer"
import ChatHeader from "@/components/channel/chat-header"
import ChatMessageList from "@/components/channel/chat-message-list"
import ReconnectBanner from "@/components/channel/reconnect-banner"
import TypingIndicator from "@/components/channel/typing-indicator"
import type {
  ChannelListItem,
  ChannelMemberRow,
  ChatMessage,
  DmListItem,
} from "@/lib/types/channel/channel-types"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"
import ConfirmDialog from "@/components/dialogs/confirm-dialog"
import CreateChannelDialog from "@/components/dialogs/channel/create-channel-dialog"
import InviteChannelMembersDialog from "@/components/dialogs/channel/invite-channel-members-dialog"
import RenameChannelDialog from "@/components/dialogs/channel/rename-channel-dialog"
import StartDmDialog from "@/components/dialogs/channel/start-dm-dialog"
import { resolveMentionCandidates } from "@/lib/channels/chat-ui-helpers"
import type {
  ChannelAiRunner,
  ExplainAiRunner,
} from "@/lib/explore/ai-runners"

/**
 * Presentational chat shell — all data via props.
 * Page / RTK layer fills props and implements callbacks.
 */
export type ChannelChatShellProps = {
  workspaceId: string
  channels: ChannelListItem[]
  dms?: DmListItem[]
  /** Workspace members for New DM + @mentions on public channels */
  workspaceMembers?: WorkspaceMemberOption[]
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
  /** Previous lastReadAt for Catch up “Since last visit” */
  lastVisitSince?: string | null
  /**
   * Explore demo — read-only chrome: disabled composer, in-place nav,
   * no profile API, injectable AI runners.
   */
  demoMode?: boolean
  onSelectChannel?: (channelId: string) => void
  onBackToList?: () => void
  aiRunner?: ChannelAiRunner
  explainRunner?: ExplainAiRunner
  /** Explore tour — pin Explain on one message */
  tutorialPinExplainMessageId?: string
  /** RTK callbacks — throw/reject on failure */
  onCreateChannel: (data: {
    name: string
    visibility: "public" | "private"
  }) => Promise<void>
  onOpenDm?: (userId: string) => Promise<void>
  onRenameChannel: (data: { name: string }) => Promise<void>
  onDeleteChannel: () => Promise<void>
  onInviteMembers: (userIds: string[]) => Promise<void>
  onRemoveMember?: (userId: string) => Promise<void>
  onSendMessage: (payload: {
    body: string
    files: File[]
    mentionedUserIds?: string[]
  }) => Promise<void>
  onEditMessage?: (messageId: string, body: string) => Promise<void>
  onDeleteMessage?: (messageId: string) => Promise<void>
  onToggleReaction?: (messageId: string, emoji: string) => Promise<void>
  onTyping?: () => void
}

export default function ChannelChatShell({
  workspaceId,
  channels,
  dms = [],
  workspaceMembers = [],
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
  lastVisitSince = null,
  demoMode = false,
  onSelectChannel,
  onBackToList,
  aiRunner,
  explainRunner,
  tutorialPinExplainMessageId,
  onCreateChannel,
  onOpenDm,
  onRenameChannel,
  onDeleteChannel,
  onInviteMembers,
  onRemoveMember,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onToggleReaction,
  onTyping,
}: ChannelChatShellProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [dmOpen, setDmOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [explainTarget, setExplainTarget] = useState<{
    id: string
    body: string
    authorName: string
    attachmentNames: string[]
  } | null>(null)
  const [profileTarget, setProfileTarget] = useState<{
    userId: string
    name: string
  } | null>(null)
  const [draftNonce, setDraftNonce] = useState(0)
  const [draftText, setDraftText] = useState("")
  const [forChannelId, setForChannelId] = useState(activeChannel?.id)

  const isPrivate = activeChannel?.visibility === "private"
  const isDm = activeChannel?.visibility === "dm"

  // Reset panels when switching channels. Members stay closed by default so
  // tablet/phone chat isn’t covered by the overlay (open via header).
  if (forChannelId !== activeChannel?.id) {
    setForChannelId(activeChannel?.id)
    setMembersOpen(false)
  }

  const showMembers = Boolean(membersOpen && isPrivate)

  const mentionCandidates = resolveMentionCandidates({
    isPrivate,
    isDm,
    peer: activeChannel?.peer,
    channelMembers,
    workspaceMembers,
    currentUserId,
  })

  const dmCandidates = workspaceMembers.filter(
    (m) => m.userId !== currentUserId
  )

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden border-border bg-background md:border-l">
      <ChannelSidebar
        workspaceId={workspaceId}
        channels={channels}
        dms={dms}
        activeChannelId={activeChannel?.id}
        canCreate={canManage && !demoMode}
        onCreateClick={() => setCreateOpen(true)}
        onNewDmClick={
          !demoMode && onOpenDm ? () => setDmOpen(true) : undefined
        }
        onSelectChannel={onSelectChannel}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!activeChannel ? (
          channels.length === 0 && dms.length === 0 ? (
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
              Select a channel or direct message
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
              canManage={canManage && !demoMode}
              backHref={
                demoMode
                  ? undefined
                  : `/workspace/${workspaceId}/channels?list=1`
              }
              onBack={demoMode ? onBackToList : undefined}
              onRename={
                demoMode || isDm ? undefined : () => setRenameOpen(true)
              }
              onDelete={
                demoMode || isDm ? undefined : () => setDeleteOpen(true)
              }
              onInvite={
                demoMode || !isPrivate || isDm
                  ? undefined
                  : () => setInviteOpen(true)
              }
              onToggleMembers={
                isPrivate && !isDm
                  ? () => setMembersOpen((v) => !v)
                  : undefined
              }
              onOpenAi={() => setAiOpen(true)}
            />
            <ReconnectBanner visible={reconnecting} />
            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={messagesLoading}
              isError={messagesError}
              mentionNameById={Object.fromEntries(
                mentionCandidates.map((m) => [m.userId, m.fullName])
              )}
              onExplainMessage={(target) => setExplainTarget(target)}
              onOpenProfile={
                demoMode
                  ? undefined
                  : (target) => setProfileTarget(target)
              }
              tutorialPinExplainMessageId={tutorialPinExplainMessageId}
              canModerate={canManage && !demoMode}
              onEditMessage={
                demoMode || !onEditMessage ? undefined : onEditMessage
              }
              onRequestDeleteMessage={
                demoMode || !onDeleteMessage
                  ? undefined
                  : (id) => setDeleteMessageId(id)
              }
              onToggleReaction={
                demoMode || !onToggleReaction ? undefined : onToggleReaction
              }
            />
            <TypingIndicator label={typingLabel} />
            <ChatComposer
              channelName={activeChannel.name}
              mentionCandidates={mentionCandidates}
              onSend={onSendMessage}
              onTyping={onTyping}
              isSending={isSending}
              disabled={demoMode}
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
            onOpenProfile={(m) =>
              setProfileTarget({ userId: m.userId, name: m.fullName })
            }
          />
        </>
      ) : null}

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreateChannel}
      />

      {onOpenDm ? (
        <StartDmDialog
          open={dmOpen}
          onOpenChange={setDmOpen}
          candidates={dmCandidates}
          onSelect={onOpenDm}
        />
      ) : null}

      {activeChannel ? (
        <>
          <ChannelAiPanel
            open={aiOpen}
            onOpenChange={setAiOpen}
            workspaceId={workspaceId}
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            lastVisitSince={lastVisitSince}
            runner={aiRunner}
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
            runner={explainRunner}
          />
          {!demoMode ? (
            <ProfileCardDialog
              open={profileTarget != null}
              onOpenChange={(open) => {
                if (!open) setProfileTarget(null)
              }}
              workspaceId={workspaceId}
              userId={profileTarget?.userId ?? null}
              fallbackName={profileTarget?.name}
            />
          ) : null}
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
          <ConfirmDialog
            open={deleteMessageId != null}
            onOpenChange={(open) => {
              if (!open) setDeleteMessageId(null)
            }}
            title="Delete message?"
            description="This message will be removed for everyone in the channel."
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={async () => {
              if (!deleteMessageId || !onDeleteMessage) return
              await onDeleteMessage(deleteMessageId)
              setDeleteMessageId(null)
            }}
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
