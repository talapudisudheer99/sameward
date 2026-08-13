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

type MentionOption =
  | {
      kind: "member"
      member: WorkspaceMemberOption
      key: string
      label: string
      sublabel?: string
    }
  | {
      kind: "all"
      key: string
      label: string
      sublabel: string
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
  const [mentionSuppressed, setMentionSuppressed] = useState(false)
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
    setMentionSuppressed(false)
  }

  const mentionMatches = useMemo<MentionOption[]>(() => {
    if (mentionSuppressed || !mentionQuery) return []
    const q = mentionQuery.query.toLowerCase().trim()
    const members = mentionCandidates
      .filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const an = a.fullName.toLowerCase()
        const bn = b.fullName.toLowerCase()
        const aStarts = an.startsWith(q)
        const bStarts = bn.startsWith(q)
        if (aStarts !== bStarts) return aStarts ? -1 : 1
        return an.localeCompare(bn)
      })
      .slice(0, 7)
      .map(
        (member): MentionOption => ({
          kind: "member",
          member,
          key: member.userId,
          label: member.fullName,
          sublabel: member.email,
        })
      )

    const allMatches = q.length === 0 || "all".startsWith(q)
    const allOption: MentionOption[] = allMatches
      ? [
          {
            kind: "all",
            key: "__all__",
            label: "@all",
            sublabel: "Notify everyone in this channel",
          },
        ]
      : []

    return [...allOption, ...members]
  }, [mentionCandidates, mentionQuery, mentionSuppressed])

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

  function insertMention(option: MentionOption) {
    if (!mentionQuery) return
    const before = body.slice(0, mentionQuery.start)
    const after = body.slice(caret)
    const token =
      option.kind === "all" ? "@all" : `@${option.member.fullName}`
    const next = `${before}${token} ${after}`
    setBody(next)
    if (option.kind === "member") {
      setMentionIds((prev) =>
        prev.includes(option.member.userId)
          ? prev
          : [...prev, option.member.userId]
      )
    }
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
        setMentionSuppressed(true)
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
        teammates or @all
      </p>

      <div className="relative rounded-[var(--radius)] border border-border bg-background">
        {mentionMatches.length > 0 && mentionQuery ? (
          <ul
            className="absolute bottom-full left-0 z-20 mb-2 max-h-56 w-full max-w-md overflow-y-auto rounded-xl border border-border/80 bg-card p-1.5 shadow-[0_10px_30px_-18px_rgba(2,6,23,0.35)]"
            role="listbox"
            aria-label="Mention someone"
          >
            {mentionMatches.map((m, i) => (
              <li key={m.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === mentionIndex}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left text-sm transition-colors",
                    i === mentionIndex
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/25"
                      : "hover:bg-muted/70"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(m)
                  }}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      m.kind === "all"
                        ? "bg-primary text-primary-foreground"
                        : "brand-tile"
                    )}
                  >
                    {m.kind === "all" ? "ALL" : m.label.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{m.label}</span>
                    {m.sublabel ? (
                      <span className="block text-xs text-muted-foreground">
                        {m.sublabel}
                      </span>
                    ) : null}
                  </span>
                  {i === mentionIndex ? (
                    <span className="mt-0.5 shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Enter
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
          aria-label={`Message ${channelName}`}
          placeholder={`Message ${channelName}`}
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
