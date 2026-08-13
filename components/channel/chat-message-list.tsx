"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  MessageCircle,
  Pencil,
  Smile,
  SmilePlus,
  Sparkles,
  Trash2,
} from "lucide-react"

import ChatAttachments from "@/components/channel/chat-attachments"
import EmojiPicker from "@/components/channel/emoji-picker"
import Loader from "@/components/sharable/loader"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAutosizeTextarea } from "@/hooks/use-autosize-textarea"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/types/channel/channel-types"

type ChatMessageListProps = {
  messages: ChatMessage[]
  currentUserId: string
  /** userId → display name for highlighting @mentions */
  mentionNameById?: Record<string, string>
  /** Initial history fetch in flight */
  isLoading?: boolean
  /** History request failed */
  isError?: boolean
  /** Retry history fetch after isError */
  onRetryLoad?: () => void
  className?: string
  /** Path A — open explain dialog for this message */
  onExplainMessage?: (target: {
    id: string
    body: string
    authorName: string
    attachmentNames: string[]
  }) => void
  /** Profile v1 — open author card */
  onOpenProfile?: (target: { userId: string; name: string }) => void
  /** Explore tour — keep Explain visible on this message */
  tutorialPinExplainMessageId?: string
  /** Owner | admin — may delete others’ messages */
  canModerate?: boolean
  onEditMessage?: (messageId: string, body: string) => Promise<void>
  onRequestDeleteMessage?: (messageId: string) => void
  onToggleReaction?: (messageId: string, emoji: string) => Promise<void>
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

/** Avoid SSR/client locale mismatch on `<time>` text (Node vs browser). */
function MessageTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    setLabel(formatTime(iso))
  }, [iso])

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label ?? ""}
    </time>
  )
}

/** Highlight @Full Name tokens for mentioned users. */
function renderBodyWithMentions(
  body: string,
  mentionedUserIds: string[] | undefined,
  mentionNameById: Record<string, string> | undefined,
  mine: boolean
) {
  const names = (mentionedUserIds ?? [])
    .map((id) => mentionNameById?.[id])
    .filter((n): n is string => Boolean(n))
    .sort((a, b) => b.length - a.length)

  const escaped = names.map((n) =>
    n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  )
  const namePattern = escaped.length > 0 ? `(?:${escaped.join("|")})` : null
  const re = new RegExp(
    `(@all\\b${namePattern ? `|@${namePattern}` : ""})`,
    "gi"
  )
  const parts = body.split(re)

  if (parts.length === 1) return body

  return parts.map((part, i) => {
    const isAll = part.toLowerCase() === "@all"
    const isNamedMention =
      part.startsWith("@") && names.some((n) => part === `@${n}`)
    if (isAll || isNamedMention) {
      return (
        <span
          key={`${part}-${i}`}
          className={cn(
            "font-semibold",
            mine
              ? "text-primary-foreground underline decoration-primary-foreground/55 underline-offset-2"
              : "rounded-md bg-primary/12 px-1 py-0.5 text-primary"
          )}
        >
          {part}
        </span>
      )
    }
    return <span key={`t-${i}`}>{part}</span>
  })
}

type MessageActionsMenuProps = {
  children: ReactNode
  className?: string
  canExplain: boolean
  canReact: boolean
  canEdit: boolean
  canDelete: boolean
  onExplain?: () => void
  onReact?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

/** Right-click / long-press actions for a message bubble. */
function MessageActionsMenu({
  children,
  className,
  canExplain,
  canReact,
  canEdit,
  canDelete,
  onExplain,
  onReact,
  onEdit,
  onDelete,
}: MessageActionsMenuProps) {
  const hasActions = canExplain || canReact || canEdit || canDelete
  if (!hasActions) {
    return <div className={className}>{children}</div>
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger className={cn("w-fit max-w-full outline-none", className)}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-44">
        {canExplain ? (
          <ContextMenuItem onClick={onExplain}>
            <Sparkles className="size-4 text-primary" strokeWidth={2.25} />
            Explain with AI
          </ContextMenuItem>
        ) : null}
        {canReact ? (
          <ContextMenuItem onClick={onReact}>
            <SmilePlus className="size-4" />
            Add reaction
          </ContextMenuItem>
        ) : null}
        {canEdit ? (
          <ContextMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </ContextMenuItem>
        ) : null}
        {canDelete ? (
          <>
            {(canExplain || canReact || canEdit) && <ContextMenuSeparator />}
            <ContextMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}

/**
 * Ch-D transcript — presentational.
 * Parent passes messages from RTK GET; socket appends later.
 */
export default function ChatMessageList({
  messages,
  currentUserId,
  mentionNameById,
  isLoading = false,
  isError = false,
  onRetryLoad,
  className,
  onExplainMessage,
  onOpenProfile,
  tutorialPinExplainMessageId,
  canModerate = false,
  onEditMessage,
  onRequestDeleteMessage,
  onToggleReaction,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [editSaving, setEditSaving] = useState(false)
  const [editEmojiOpen, setEditEmojiOpen] = useState(false)
  const [reactPickerFor, setReactPickerFor] = useState<string | null>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editEmojiWrapRef = useRef<HTMLDivElement>(null)

  useAutosizeTextarea(editTextareaRef, editDraft, 160)

  useEffect(() => {
    if (!editEmojiOpen) return
    function onDoc(e: MouseEvent) {
      if (!editEmojiWrapRef.current?.contains(e.target as Node)) {
        setEditEmojiOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [editEmojiOpen])

  // Close emoji picker when leaving edit mode
  useEffect(() => {
    if (!editingId) setEditEmojiOpen(false)
  }, [editingId])

  // Place caret at end when entering edit (autoFocus alone lands at start)
  useEffect(() => {
    if (!editingId) return
    const el = editTextareaRef.current
    if (!el) return
    const placeAtEnd = () => {
      const len = el.value.length
      el.focus()
      el.setSelectionRange(len, len)
    }
    requestAnimationFrame(placeAtEnd)
  }, [editingId])

  // Stick to bottom when messages change (send / first load)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Drop edit mode if the message was deleted remotely
  useEffect(() => {
    if (!editingId) return
    const row = messages.find((m) => m.id === editingId)
    if (!row || row.deletedAt) {
      setEditingId(null)
      setEditDraft("")
    }
  }, [messages, editingId])

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 items-center justify-center",
          className
        )}
      >
        <Loader className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          Couldn’t load messages.
        </p>
        {onRetryLoad ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetryLoad}>
            Try again
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">Refresh the page to retry.</p>
        )}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "bg-brand-wash flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 text-center",
          className
        )}
      >
        <span
          className="brand-tile flex size-11 items-center justify-center rounded-full"
          aria-hidden
        >
          <MessageCircle className="size-5" strokeWidth={1.5} />
        </span>
        <p className="text-sm text-muted-foreground">
          No messages yet. Say hello.
        </p>
      </div>
    )
  }

  async function saveEdit(messageId: string) {
    if (!onEditMessage) return
    const next = editDraft.trim()
    if (!next) return
    setEditSaving(true)
    try {
      await onEditMessage(messageId, next)
      setEditingId(null)
      setEditDraft("")
      setEditEmojiOpen(false)
    } finally {
      setEditSaving(false)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft("")
    setEditEmojiOpen(false)
  }

  function insertEditEmoji(emoji: string) {
    const el = editTextareaRef.current
    const start = el?.selectionStart ?? editDraft.length
    const end = el?.selectionEnd ?? editDraft.length
    const next = `${editDraft.slice(0, start)}${emoji}${editDraft.slice(end)}`
    if (next.length > 4000) return
    setEditDraft(next)
    setEditEmojiOpen(false)
    const nextCaret = start + emoji.length
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(nextCaret, nextCaret)
    })
  }

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-4 sm:py-4",
        className
      )}
      data-explore-tutorial="transcript"
    >
      {messages.map((msg, i) => {
        const pinExplain = msg.id === tutorialPinExplainMessageId
        const mine = msg.authorId === currentUserId
        const deleted = Boolean(msg.deletedAt)
        const edited = Boolean(msg.editedAt) && !deleted
        const isEditing = editingId === msg.id
        const canEdit =
          !deleted &&
          !msg.pending &&
          mine &&
          Boolean(onEditMessage) &&
          Boolean(msg.body)
        const canDelete =
          !deleted &&
          !msg.pending &&
          Boolean(onRequestDeleteMessage) &&
          (mine || canModerate)
        const canReact =
          !deleted && !msg.pending && Boolean(onToggleReaction)
        const reactions = msg.reactions ?? []
        const prev = messages[i - 1]
        // Group consecutive messages by the same author within ~5 minutes
        const grouped =
          !deleted &&
          prev?.authorId === msg.authorId &&
          !prev.deletedAt &&
          new Date(msg.createdAt).getTime() -
            new Date(prev?.createdAt ?? 0).getTime() <
            5 * 60 * 1000
        const hasAttachments = !deleted && msg.attachments.length > 0

        return (
          <article
            key={msg.id}
            className={cn(
              "flex gap-2",
              isEditing
                ? "w-full max-w-[min(94%,36rem)] sm:max-w-[min(92%,40rem)]"
                : "max-w-[min(92%,20rem)] sm:max-w-[min(85%,32rem)]",
              grouped ? "mt-0.5" : "mt-3",
              mine ? "ml-auto flex-row-reverse" : "mr-auto",
              msg.pending && "opacity-70"
            )}
          >
            {grouped ? (
              <span className="w-7 shrink-0" aria-hidden />
            ) : onOpenProfile && !deleted ? (
              <button
                type="button"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium outline-none hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ${msg.authorName}'s profile`}
                onClick={() =>
                  onOpenProfile({
                    userId: msg.authorId,
                    name: msg.authorName,
                  })
                }
              >
                {(msg.authorName || "?").slice(0, 1).toUpperCase()}
              </button>
            ) : (
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium"
                aria-hidden
              >
                {(msg.authorName || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div
              className={cn(
                "flex min-w-0 flex-col gap-1",
                isEditing
                  ? "w-full items-stretch"
                  : mine
                    ? "items-end"
                    : "items-start"
              )}
            >
              {grouped ? null : (
                <div
                  className={cn(
                    "flex items-baseline gap-x-2 px-1 text-xs text-muted-foreground",
                    mine && "flex-row-reverse"
                  )}
                >
                  {onOpenProfile && !deleted ? (
                    <button
                      type="button"
                      className="font-medium text-foreground hover:underline"
                      onClick={() =>
                        onOpenProfile({
                          userId: msg.authorId,
                          name: msg.authorName,
                        })
                      }
                    >
                      {msg.authorName}
                    </button>
                  ) : (
                    <span className="font-medium text-foreground">
                      {msg.authorName}
                    </span>
                  )}
                  <MessageTime iso={msg.createdAt} />
                  {edited ? (
                    <span className="italic text-muted-foreground">edited</span>
                  ) : null}
                </div>
              )}

              {deleted ? (
                <p className="rounded-2xl bg-muted/60 px-3 py-1.5 text-sm italic text-muted-foreground">
                  This message was deleted
                </p>
              ) : isEditing ? (
                <div className="w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm ring-1 ring-primary/15">
                  <textarea
                    ref={editTextareaRef}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault()
                        cancelEdit()
                        return
                      }
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault()
                        void saveEdit(msg.id)
                      }
                    }}
                    rows={1}
                    maxLength={4000}
                    disabled={editSaving}
                    aria-label="Edit message"
                    className="max-h-40 min-h-11 w-full resize-none overflow-hidden bg-transparent px-3 pt-2.5 pb-1.5 text-sm leading-relaxed outline-none disabled:opacity-50"
                  />
                  <div className="flex items-center gap-1 border-t border-border px-1.5 py-1.5">
                    <div ref={editEmojiWrapRef} className="relative">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={editSaving}
                        aria-label="Insert emoji"
                        aria-expanded={editEmojiOpen}
                        title="Insert emoji"
                        onClick={() => setEditEmojiOpen((v) => !v)}
                      >
                        <Smile className="size-4" />
                      </Button>
                      {editEmojiOpen ? (
                        <div className="absolute bottom-full left-0 z-40 mb-2">
                          <EmojiPicker
                            label="Insert emoji into message"
                            onSelect={insertEditEmoji}
                          />
                        </div>
                      ) : null}
                    </div>
                    <p className="hidden px-1 text-[11px] text-muted-foreground sm:block">
                      Esc to cancel · ⌘↵ to save
                    </p>
                    <div className="ml-auto flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={editSaving}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={editSaving || !editDraft.trim()}
                        onClick={() => void saveEdit(msg.id)}
                        className="btn-brand-gradient px-3"
                      >
                        {editSaving ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {msg.body ? (
                    <div className="relative w-fit max-w-full">
                      <MessageActionsMenu
                        canExplain={Boolean(onExplainMessage && !msg.pending)}
                        canReact={canReact}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onExplain={() =>
                          onExplainMessage?.({
                            id: msg.id,
                            body: msg.body,
                            authorName: msg.authorName,
                            attachmentNames: msg.attachments.map((a) => a.name),
                          })
                        }
                        onReact={() => setReactPickerFor(msg.id)}
                        onEdit={() => {
                          setEditingId(msg.id)
                          setEditDraft(msg.body)
                        }}
                        onDelete={() => onRequestDeleteMessage?.(msg.id)}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-3 py-1.5 text-left text-sm leading-relaxed select-none md:select-text [-webkit-touch-callout:none]",
                            mine
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-muted text-foreground"
                          )}
                        >
                          <p className="[overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                            {renderBodyWithMentions(
                              msg.body,
                              msg.mentionedUserIds,
                              mentionNameById,
                              mine
                            )}
                          </p>
                        </div>
                      </MessageActionsMenu>
                      {pinExplain && onExplainMessage && !msg.pending ? (
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          title="Explain with AI"
                          className={cn(
                            "absolute top-full mt-1.5 brand-tile size-7 text-primary shadow-md ring-2 ring-primary",
                            mine ? "right-0" : "left-0"
                          )}
                          aria-label="Explain message with AI"
                          data-explore-tutorial="explain-button"
                          onClick={() =>
                            onExplainMessage({
                              id: msg.id,
                              body: msg.body,
                              authorName: msg.authorName,
                              attachmentNames: msg.attachments.map(
                                (a) => a.name
                              ),
                            })
                          }
                        >
                          <Sparkles className="size-3.5" strokeWidth={2.25} />
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                  {(msg.pending || msg.failed) && (
                    <span
                      className={cn(
                        "px-1 text-xs",
                        msg.failed
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {msg.failed ? "Not sent" : "Sending…"}
                    </span>
                  )}
                  {hasAttachments ? (
                    msg.body ? (
                      <ChatAttachments
                        attachments={msg.attachments}
                        mine={mine}
                      />
                    ) : (
                      <MessageActionsMenu
                        canExplain={Boolean(onExplainMessage && !msg.pending)}
                        canReact={canReact}
                        canEdit={false}
                        canDelete={canDelete}
                        onExplain={() =>
                          onExplainMessage?.({
                            id: msg.id,
                            body: msg.body,
                            authorName: msg.authorName,
                            attachmentNames: msg.attachments.map((a) => a.name),
                          })
                        }
                        onReact={() => setReactPickerFor(msg.id)}
                        onDelete={() => onRequestDeleteMessage?.(msg.id)}
                      >
                        <ChatAttachments
                          attachments={msg.attachments}
                          mine={mine}
                        />
                      </MessageActionsMenu>
                    )
                  ) : null}
                  {reactions.length > 0 ? (
                    <div
                      className={cn(
                        "flex max-w-full flex-wrap gap-1 px-0.5",
                        mine ? "justify-end" : "justify-start"
                      )}
                    >
                      {reactions.map((r) => {
                        const mineReacted = r.userIds.includes(currentUserId)
                        return (
                          <button
                            key={r.emoji}
                            type="button"
                            disabled={!onToggleReaction}
                            onClick={() =>
                              void onToggleReaction?.(msg.id, r.emoji)
                            }
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs tabular-nums transition-colors",
                              mineReacted
                                ? "border-primary/40 bg-primary/10 text-foreground"
                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                              !onToggleReaction && "cursor-default"
                            )}
                            aria-label={
                              mineReacted
                                ? `Remove ${r.emoji} reaction`
                                : `Add ${r.emoji} reaction`
                            }
                            aria-pressed={mineReacted}
                          >
                            <span aria-hidden>{r.emoji}</span>
                            <span>{r.count}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </article>
        )
      })}
      <div ref={bottomRef} aria-hidden />

      <Dialog
        open={reactPickerFor != null}
        onOpenChange={(open) => {
          if (!open) setReactPickerFor(null)
        }}
      >
        <DialogContent
          showCloseButton
          className="w-auto max-w-[calc(100%-2rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
          overlayClassName="bg-black/25"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Add reaction</DialogTitle>
            <DialogDescription>Choose an emoji for this message.</DialogDescription>
          </DialogHeader>
          <EmojiPicker
            label="React to message"
            onSelect={(emoji) => {
              const id = reactPickerFor
              setReactPickerFor(null)
              if (id) void onToggleReaction?.(id, emoji)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
