"use client"

import { useState } from "react"
import { Copy, Sparkles } from "lucide-react"
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
import type { AiTone } from "@/lib/types/ai/ai-types"
import { cn } from "@/lib/utils"
import {
  useAiAskMutation,
  useAiCatchUpMutation,
  useAiDraftReplyMutation,
  useAiNotesMutation,
  useAiSummarizeMutation,
} from "@/store/api/ai/ai-api"

type TabId = "summarize" | "catch-up" | "ask" | "draft" | "notes"

type ChannelAiPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  channelId: string
  channelName: string
  /** Insert draft into composer — never auto-sends */
  onInsertDraft: (text: string) => void
}

function sinceYesterday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - 1)
  return d.toISOString()
}

function sinceDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return d.toISOString()
}

/**
 * Channel AI panel — Path A capabilities (read-only).
 */
export default function ChannelAiPanel({
  open,
  onOpenChange,
  workspaceId,
  channelId,
  channelName,
  onInsertDraft,
}: ChannelAiPanelProps) {
  const [tab, setTab] = useState<TabId>("summarize")
  const [result, setResult] = useState<string>("")
  const [metaLine, setMetaLine] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  const [tone, setTone] = useState<AiTone>("concise")

  const [summarize, { isLoading: summarizing }] = useAiSummarizeMutation()
  const [catchUp, { isLoading: catchingUp }] = useAiCatchUpMutation()
  const [ask, { isLoading: asking }] = useAiAskMutation()
  const [draftReply, { isLoading: drafting }] = useAiDraftReplyMutation()
  const [notes, { isLoading: noting }] = useAiNotesMutation()

  const busy = summarizing || catchingUp || asking || drafting || noting

  function applyResult(text: string, messageCount: number, truncated: boolean) {
    setResult(text)
    setMetaLine(
      truncated
        ? `Used ${messageCount} messages (truncated to fit context)`
        : `Used ${messageCount} messages`
    )
  }

  async function runSummarize() {
    try {
      const data = await summarize({ workspaceId, channelId }).unwrap()
      applyResult(data.text, data.meta.messageCount, data.meta.truncated)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    }
  }

  async function runCatchUp(since: string, label: string) {
    try {
      const data = await catchUp({ workspaceId, channelId, since }).unwrap()
      applyResult(data.text, data.meta.messageCount, data.meta.truncated)
      toast.success(`Catch-up: ${label}`)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    }
  }

  async function runAsk() {
    const q = question.trim()
    if (!q) {
      toast.error("Type a question first")
      return
    }
    try {
      const data = await ask({ workspaceId, channelId, question: q }).unwrap()
      applyResult(data.text, data.meta.messageCount, data.meta.truncated)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    }
  }

  async function runDraft() {
    try {
      const data = await draftReply({
        workspaceId,
        channelId,
        tone,
      }).unwrap()
      onInsertDraft(data.text)
      onOpenChange(false)
      toast.success("Draft inserted into composer — edit and Send when ready")
    } catch (err) {
      toast.error(aiErrorMessage(err))
    }
  }

  async function runNotes() {
    try {
      const data = await notes({ workspaceId, channelId }).unwrap()
      applyResult(data.text, data.meta.messageCount, data.meta.truncated)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    }
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast.success("Copied")
    } catch {
      toast.error("Could not copy")
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "summarize", label: "Summarize" },
    { id: "catch-up", label: "Catch up" },
    { id: "ask", label: "Ask" },
    { id: "draft", label: "Draft" },
    { id: "notes", label: "Notes" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,40rem)] max-w-lg flex-col gap-3 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            AI · #{channelName}
          </DialogTitle>
          <DialogDescription>
            Read-only help over messages you can already see. Nothing is posted
            for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant={tab === t.id ? "default" : "ghost"}
              onClick={() => setTab(t.id)}
              disabled={busy}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          {tab === "summarize" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Summarize recent messages in this channel.
              </p>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runSummarize()}
              >
                {summarizing ? "Working…" : "Generate summary"}
              </Button>
            </div>
          ) : null}

          {tab === "catch-up" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Summarize what happened since a point in time.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void runCatchUp(sinceYesterday(), "since yesterday")
                  }
                >
                  Since yesterday
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void runCatchUp(sinceDaysAgo(7), "last 7 days")
                  }
                >
                  Last 7 days
                </Button>
              </div>
            </div>
          ) : null}

          {tab === "ask" ? (
            <div className="space-y-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={busy}
                rows={3}
                maxLength={2000}
                placeholder="Ask about this channel…"
                className="w-full resize-none rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runAsk()}
              >
                {asking ? "Thinking…" : "Ask"}
              </Button>
            </div>
          ) : null}

          {tab === "draft" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Inserts a suggestion into the composer. You still click Send.
              </p>
              <div className="flex flex-wrap gap-1">
                {(["concise", "friendly", "formal"] as AiTone[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={tone === t ? "default" : "outline"}
                    disabled={busy}
                    onClick={() => setTone(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runDraft()}
              >
                {drafting ? "Drafting…" : "Draft into composer"}
              </Button>
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Structured markdown notes you can copy — not saved as a Doc.
              </p>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runNotes()}
              >
                {noting ? "Writing…" : "Generate notes"}
              </Button>
            </div>
          ) : null}

          {result ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{metaLine}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void copyResult()}
                  className="gap-1"
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <pre
                className={cn(
                  "max-h-64 overflow-y-auto rounded-[var(--radius)] border border-border bg-muted/40 p-3 text-left text-xs leading-relaxed whitespace-pre-wrap"
                )}
              >
                {result}
              </pre>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
