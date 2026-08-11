"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { FileText, Paperclip, Send, Smile, X } from "lucide-react"

import EmojiPicker from "@/components/channel/emoji-picker"
import { Button } from "@/components/ui/button"
import { useAutosizeTextarea } from "@/hooks/use-autosize-textarea"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"
import { cn } from "@/lib/utils"

const MAX_FILES = 3
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
])

export type ComposerPendingFile = {
  /** local preview key */
  key: string
  file: File
  previewUrl?: string
}

type ChatComposerProps = {
  channelName: string
  disabled?: boolean
  /** People available for @mentions */
  mentionCandidates?: WorkspaceMemberOption[]
  /**
   * Wire RTK + S3:
   * 1) upload pending files → attachment metadata
   * 2) POST message { body, attachments, mentionedUserIds, clientMessageId }
   */
  onSend: (payload: {
    body: string
    files: File[]
    mentionedUserIds?: string[]
  }) => Promise<void>
  /** Optional: emit typing (socket later) */
  onTyping?: () => void
  isSending?: boolean
  /**
   * AI draft — bump `draftNonce` when applying `draftText`
   * (adjust state during render; avoids setState-in-effect).
   */
  draftNonce?: number
  draftText?: string
}

type MentionQuery = {
  start: number
  query: string
}

function findMentionQuery(text: string, caret: number): MentionQuery | null {
  const before = text.slice(0, caret)
  const match = before.match(/(^|[\s])@([^\s@]*)$/)
  if (!match) return null
  const query = match[2] ?? ""
  const start = before.length - query.length - 1
  return { start, query }
}

/**
 * Ch-D composer — text + @mentions + local file chips.
 */
export default function ChatComposer({
  channelName,
  disabled,
  mentionCandidates = [],
  onSend,
  onTyping,
  isSending = false,
  draftNonce = 0,
  draftText = "",
}: ChatComposerProps) {
  const [body, setBody] = useState("")
  const [pending, setPending] = useState<ComposerPendingFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [seenDraftNonce, setSeenDraftNonce] = useState(0)
  const [mentionIds, setMentionIds] = useState<string[]>([])
  const [caret, setCaret] = useState(0)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [mentionQueryKey, setMentionQueryKey] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiWrapRef = useRef<HTMLDivElement>(null)

  // Start ~3 lines tall; grow with content up to ~6 lines, then scroll
  useAutosizeTextarea(textareaRef, body, 160)

  useEffect(() => {
    if (!emojiOpen) return
    function onDoc(e: MouseEvent) {
      if (!emojiWrapRef.current?.contains(e.target as Node)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [emojiOpen])

  if (draftNonce > 0 && draftNonce !== seenDraftNonce) {
    setSeenDraftNonce(draftNonce)
    setBody(draftText)
  }

  const mentionQuery = useMemo(
    () => findMentionQuery(body, caret),
    [body, caret]
  )

  const nextMentionQueryKey = mentionQuery
    ? `${mentionQuery.start}:${mentionQuery.query}`
    : ""
  if (nextMentionQueryKey !== mentionQueryKey) {
    setMentionQueryKey(nextMentionQueryKey)
    setMentionIndex(0)
  }

  const mentionMatches = useMemo(() => {
    if (!mentionQuery) return []
    const q = mentionQuery.query.toLowerCase()
    return mentionCandidates
      .filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [mentionCandidates, mentionQuery])

  function clearPending() {
    for (const p of pending) {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl)
    }
    setPending([])
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return
    setError(null)
    const next = [...pending]
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setError(`Max ${MAX_FILES} files`)
        break
      }
      if (!ALLOWED.has(file.type)) {
        setError("Only images (jpeg/png/webp/gif) and PDF")
        continue
      }
      if (file.size > MAX_BYTES) {
        setError("Each file must be 10MB or less")
        continue
      }
      next.push({
        key: `${file.name}-${file.size}-${Date.now()}`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })
    }
    setPending(next)
    if (fileRef.current) fileRef.current.value = ""
  }

  function removePending(key: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.key === key)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.key !== key)
    })
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    const start = el?.selectionStart ?? body.length
    const end = el?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`
    setBody(next)
    setEmojiOpen(false)
    const nextCaret = start + emoji.length
    setCaret(nextCaret)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(nextCaret, nextCaret)
    })
  }

  function insertMention(member: WorkspaceMemberOption) {
    if (!mentionQuery) return
    const before = body.slice(0, mentionQuery.start)
    const after = body.slice(caret)
    const token = `@${member.fullName}`
    const next = `${before}${token} ${after}`
    setBody(next)
    setMentionIds((prev) =>
      prev.includes(member.userId) ? prev : [...prev, member.userId]
    )
    const nextCaret = before.length + token.length + 1
    setCaret(nextCaret)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(nextCaret, nextCaret)
    })
  }

  async function handleSend() {
    const trimmed = body.trim()
    if (!trimmed && pending.length === 0) return
    setError(null)

    // Keep only mention ids still referenced as @Full Name in the body
    const stillMentioned = mentionIds.filter((id) => {
      const name = mentionCandidates.find((m) => m.userId === id)?.fullName
      return name ? trimmed.includes(`@${name}`) : false
    })

    try {
      await onSend({
        body: trimmed,
        files: pending.map((p) => p.file),
        mentionedUserIds:
          stillMentioned.length > 0 ? stillMentioned : undefined,
      })
      setBody("")
      setMentionIds([])
      clearPending()
    } catch {
      // Keep draft so the user can retry; toast lives in the page
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionMatches.length > 0 && mentionQuery) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setMentionIndex((i) => (i + 1) % mentionMatches.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setMentionIndex(
          (i) => (i - 1 + mentionMatches.length) % mentionMatches.length
        )
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const pick = mentionMatches[mentionIndex]
        if (pick) insertMention(pick)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setCaret(caret) // keep; clearing query by moving isn't needed
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="shrink-0 border-t border-border bg-card px-2 py-2.5 sm:px-4 sm:py-3">
      {pending.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {pending.map((p) => (
            <div
              key={p.key}
              className="relative flex items-center gap-2 rounded-[var(--radius)] border border-border bg-muted/50 py-1.5 pr-8 pl-2 text-xs"
            >
              {p.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.previewUrl}
                  alt=""
                  className="size-8 rounded object-cover"
                />
              ) : (
                <FileText className="size-4 text-primary" />
              )}
              <span className="max-w-[8rem] truncate">{p.file.name}</span>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="absolute top-0.5 right-0.5"
                onClick={() => removePending(p.key)}
                aria-label="Remove file"
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mb-1.5 text-[11px] text-muted-foreground">
        Max {MAX_FILES} files · 10 MB · images &amp; PDF · type @ to mention
      </p>

      <div className="relative rounded-[var(--radius)] border border-border bg-background">
        {mentionMatches.length > 0 && mentionQuery ? (
          <ul
            className="absolute bottom-full left-0 z-20 mb-1 max-h-48 w-full max-w-sm overflow-y-auto rounded-md border border-border bg-card py-1 shadow-md"
            role="listbox"
            aria-label="Mention someone"
          >
            {mentionMatches.map((m, i) => (
              <li key={m.userId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === mentionIndex}
                  className={cn(
                    "flex w-full flex-col px-3 py-2 text-left text-sm",
                    i === mentionIndex ? "bg-primary/10" : "hover:bg-muted"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(m)
                  }}
                >
                  <span className="font-medium">{m.fullName}</span>
                  {m.email ? (
                    <span className="text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setCaret(e.target.selectionStart)
            onTyping?.()
          }}
          onSelect={(e) => {
            setCaret(e.currentTarget.selectionStart)
          }}
          onKeyUp={(e) => {
            setCaret(e.currentTarget.selectionStart)
          }}
          onClick={(e) => {
            setCaret(e.currentTarget.selectionStart)
          }}
          onKeyDown={onKeyDown}
          disabled={disabled || isSending}
          placeholder={`Message ${channelName.startsWith("#") ? channelName : channelName}`}
          rows={1}
          maxLength={4000}
          className="max-h-40 min-h-[4.5rem] w-full resize-none overflow-hidden bg-transparent px-3 pt-3 pb-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            multiple
            onChange={(e) => addFiles(e.target.files)}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={disabled || isSending || pending.length >= MAX_FILES}
            onClick={() => fileRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip className="size-4" />
          </Button>
          <div ref={emojiWrapRef} className="relative">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={disabled || isSending}
              title="Insert emoji"
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile className="size-4" />
            </Button>
            {emojiOpen ? (
              <div className="absolute bottom-full left-0 z-40 mb-2">
                <EmojiPicker
                  onSelect={insertEmoji}
                  label="Insert emoji into message"
                />
              </div>
            ) : null}
          </div>
          <div className="flex-1" />
          <Button
            type="button"
            size="sm"
            disabled={
              disabled || isSending || (!body.trim() && pending.length === 0)
            }
            onClick={() => void handleSend()}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            Send
          </Button>
        </div>
      </div>

      {error ? (
        <p className={cn("mt-1.5 text-xs text-destructive")}>{error}</p>
      ) : null}
    </div>
  )
}
