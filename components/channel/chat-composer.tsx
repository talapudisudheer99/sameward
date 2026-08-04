"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { FileText, Paperclip, Send, Smile, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  /**
   * Wire RTK + S3:
   * 1) upload pending files → attachment metadata
   * 2) POST message { body, attachments, clientMessageId }
   */
  onSend: (payload: { body: string; files: File[] }) => Promise<void>
  /** Optional: emit typing (socket later) */
  onTyping?: () => void
  isSending?: boolean
}

/**
 * Ch-D composer — text + local file chips (limits enforced client-side).
 * Upload to S3 happens in onSend (your RTK/files slice).
 */
export default function ChatComposer({
  channelName,
  disabled,
  onSend,
  onTyping,
  isSending = false,
}: ChatComposerProps) {
  const [body, setBody] = useState("")
  const [pending, setPending] = useState<ComposerPendingFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  async function handleSend() {
    const trimmed = body.trim()
    if (!trimmed && pending.length === 0) return
    setError(null)
    try {
      await onSend({
        body: trimmed,
        files: pending.map((p) => p.file),
      })
      setBody("")
      clearPending()
    } catch {
      // Keep draft so the user can retry; toast lives in the page
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="shrink-0 border-t border-border bg-card px-4 py-3">
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
        Max {MAX_FILES} files · 10 MB · images &amp; PDF
      </p>

      <div className="rounded-[var(--radius)] border border-border bg-background">
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            onTyping?.()
          }}
          onKeyDown={onKeyDown}
          disabled={disabled || isSending}
          placeholder={`Message #${channelName}`}
          rows={3}
          maxLength={4000}
          className="w-full resize-none bg-transparent px-3 pt-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
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
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled
            title="Emoji picker — wire later"
            aria-label="Emoji"
          >
            <Smile className="size-4" />
          </Button>
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
