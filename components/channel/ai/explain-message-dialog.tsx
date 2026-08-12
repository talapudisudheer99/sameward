"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { aiErrorMessage } from "@/lib/ai/ai-error-message"
import { cn } from "@/lib/utils"
import { useAiExplainMutation } from "@/store/api/ai/ai-api"
import type { ExplainAiRunner } from "@/lib/explore/ai-runners"

export type ExplainTarget = {
  id: string
  body: string
  authorName: string
  attachmentNames: string[]
}

type ExplainMessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  channelId: string
  target: ExplainTarget | null
  /** Explore demo — canned explain instead of RTK */
  runner?: ExplainAiRunner
}

/**
 * Explain one message using ± neighbors (Path A).
 */
export default function ExplainMessageDialog({
  open,
  onOpenChange,
  workspaceId,
  channelId,
  target,
  runner,
}: ExplainMessageDialogProps) {
  const [text, setText] = useState("")
  const [runnerBusy, setRunnerBusy] = useState(false)
  const [explain, { isLoading }] = useAiExplainMutation()
  const busy = runnerBusy || isLoading

  const body = target?.body?.trim() ?? ""
  const files = target?.attachmentNames ?? []
  const quote = body
    ? body
    : files.length > 0
      ? `Shared file${files.length === 1 ? "" : "s"}: ${files.join(", ")}`
      : "(empty message)"
  const showFileNote = files.length > 0 && !body

  async function run() {
    if (!target?.id) return
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner(target.id)
        setText(data.text)
        return
      }
      const data = await explain({
        workspaceId,
        channelId,
        messageId: target.id,
      }).unwrap()
      setText(data.text)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    } finally {
      setRunnerBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setText("")
        onOpenChange(next)
      }}
    >
      <DialogContent
        className={cn(
          "w-[min(100%-1.5rem,36rem)] max-w-[min(100%-1.5rem,36rem)] gap-4 overflow-hidden p-5 sm:max-w-xl sm:p-6",
          "border-border bg-card shadow-xl"
        )}
      >
        <DialogHeader className="gap-1.5 pr-10 text-left">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <Sparkles className="size-5 text-primary" aria-hidden />
            Explain message
          </DialogTitle>
          <DialogDescription className="text-sm">
            Nearby chat for context. Image/PDF bytes are not opened — filenames
            only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {target ? (
            <blockquote className="border-l-2 border-primary/40 pl-3 text-left">
              <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                {target.authorName}
              </p>
              <p className="line-clamp-4 text-sm leading-relaxed text-foreground/90">
                {quote}
              </p>
              {showFileNote || (body && files.length > 0) ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {body && files.length > 0
                    ? `Also attached: ${files.join(", ")}`
                    : "AI cannot view image/PDF bytes — only the filename and thread context."}
                </p>
              ) : null}
            </blockquote>
          ) : null}

          {!text ? (
            <Button
              type="button"
              size="sm"
              disabled={busy || !target?.id}
              onClick={() => void run()}
              className="btn-brand-gradient gap-2"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {busy ? "Explaining…" : "Explain"}
            </Button>
          ) : (
            <div className="animate-in space-y-1.5 border-t border-border/60 pt-3 duration-200 fade-in-0">
              <span className="text-xs font-semibold tracking-tight">
                Explanation
              </span>
              <div className="max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {text}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
