"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
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
import { useAiExplainMutation } from "@/store/api/ai/ai-api"

type ExplainMessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  channelId: string
  messageId: string | null
}

/**
 * Explain one message using ± neighbors (Path A).
 */
export default function ExplainMessageDialog({
  open,
  onOpenChange,
  workspaceId,
  channelId,
  messageId,
}: ExplainMessageDialogProps) {
  const [text, setText] = useState("")
  const [explain, { isLoading }] = useAiExplainMutation()

  async function run() {
    if (!messageId) return
    try {
      const data = await explain({
        workspaceId,
        channelId,
        messageId,
      }).unwrap()
      setText(data.text)
    } catch (err) {
      toast.error(aiErrorMessage(err))
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
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Explain message
          </DialogTitle>
          <DialogDescription>
            Uses this message and nearby conversation for context.
          </DialogDescription>
        </DialogHeader>

        {!text ? (
          <Button
            type="button"
            size="sm"
            disabled={isLoading || !messageId}
            onClick={() => void run()}
          >
            {isLoading ? "Explaining…" : "Explain"}
          </Button>
        ) : (
          <pre className="max-h-72 overflow-y-auto rounded-[var(--radius)] border border-border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">
            {text}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  )
}
