"use client"

import { useState, type ComponentType } from "react"
import {
  Clock3,
  Copy,
  Loader2,
  MessageCircleQuestion,
  NotebookPen,
  PenLine,
  Sparkles,
} from "lucide-react"
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
import type { ChannelAiRunner } from "@/lib/explore/ai-runners"

type TabId = "summarize" | "catch-up" | "ask" | "draft" | "notes"

type ChannelAiPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  channelId: string
  channelName: string
  /** Previous lastReadAt captured before mark-read on this open */
  lastVisitSince?: string | null
  /** Insert draft into composer — never auto-sends */
  onInsertDraft: (text: string) => void
  /** Explore demo — canned runners instead of RTK */
  runner?: ChannelAiRunner
}

const TABS: {
  id: TabId
  label: string
  Icon: ComponentType<{ className?: string }>
}[] = [
  { id: "summarize", label: "Summarize", Icon: Sparkles },
  { id: "catch-up", label: "Catch up", Icon: Clock3 },
  { id: "ask", label: "Ask", Icon: MessageCircleQuestion },
  { id: "draft", label: "Draft", Icon: PenLine },
  { id: "notes", label: "Notes", Icon: NotebookPen },
]

const RESULT_LABEL: Record<TabId, string> = {
  summarize: "Summary",
  "catch-up": "Catch-up",
  ask: "Answer",
  draft: "Draft",
  notes: "Meeting notes",
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
  lastVisitSince = null,
  onInsertDraft,
  runner,
}: ChannelAiPanelProps) {
  const [tab, setTab] = useState<TabId>("summarize")
  const [result, setResult] = useState<string>("")
  const [resultTab, setResultTab] = useState<TabId>("summarize")
  const [metaLine, setMetaLine] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  const [tone, setTone] = useState<AiTone>("concise")
  const [runnerBusy, setRunnerBusy] = useState(false)

  const [summarize, { isLoading: summarizing }] = useAiSummarizeMutation()
  const [catchUp, { isLoading: catchingUp }] = useAiCatchUpMutation()
  const [ask, { isLoading: asking }] = useAiAskMutation()
  const [draftReply, { isLoading: drafting }] = useAiDraftReplyMutation()
  const [notes, { isLoading: noting }] = useAiNotesMutation()

  const busy =
    runnerBusy || summarizing || catchingUp || asking || drafting || noting

  function selectTab(next: TabId) {
    setTab(next)
    setResult("")
    setMetaLine(null)
  }

  function applyResult(
    text: string,
    messageCount: number,
    truncated: boolean,
    forTab: TabId
  ) {
    setResultTab(forTab)
    setResult(text)
    setMetaLine(
      truncated
        ? `${messageCount} messages · truncated`
        : `${messageCount} messages`
    )
  }

  async function runSummarize() {
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner.summarize()
        applyResult(
          data.text,
          data.meta.messageCount,
          data.meta.truncated,
          "summarize"
        )
        return
      }
      const data = await summarize({ workspaceId, channelId }).unwrap()
      applyResult(
        data.text,
        data.meta.messageCount,
        data.meta.truncated,
        "summarize"
      )
    } catch (err) {
      toast.error(aiErrorMessage(err))
    } finally {
      setRunnerBusy(false)
    }
  }

  async function runCatchUp(since: string, label: string) {
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner.catchUp(since)
        applyResult(
          data.text,
          data.meta.messageCount,
          data.meta.truncated,
          "catch-up"
        )
        toast.success(`Catch-up: ${label}`)
        return
      }
      const data = await catchUp({ workspaceId, channelId, since }).unwrap()
      applyResult(
        data.text,
        data.meta.messageCount,
        data.meta.truncated,
        "catch-up"
      )
      toast.success(`Catch-up: ${label}`)
    } catch (err) {
      toast.error(aiErrorMessage(err))
    } finally {
      setRunnerBusy(false)
    }
  }

  async function runAsk() {
    const q = question.trim()
    if (!q) {
      toast.error("Type a question first")
      return
    }
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner.ask(q)
        applyResult(data.text, data.meta.messageCount, data.meta.truncated, "ask")
        return
      }
      const data = await ask({ workspaceId, channelId, question: q }).unwrap()
      applyResult(data.text, data.meta.messageCount, data.meta.truncated, "ask")
    } catch (err) {
      toast.error(aiErrorMessage(err))
    } finally {
      setRunnerBusy(false)
    }
  }

  async function runDraft() {
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner.draft(tone)
        onInsertDraft(data.text)
        onOpenChange(false)
        toast.success(
          "Sample draft shown in the composer — create a workspace to send for real"
        )
        return
      }
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
    } finally {
      setRunnerBusy(false)
    }
  }

  async function runNotes() {
    try {
      if (runner) {
        setRunnerBusy(true)
        const data = await runner.notes()
        applyResult(
          data.text,
          data.meta.messageCount,
          data.meta.truncated,
          "notes"
        )
        return
      }
      const data = await notes({ workspaceId, channelId }).unwrap()
      applyResult(
        data.text,
        data.meta.messageCount,
        data.meta.truncated,
        "notes"
      )
    } catch (err) {
      toast.error(aiErrorMessage(err))
    } finally {
      setRunnerBusy(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,36rem)] w-[min(100%-1.5rem,28rem)] max-w-[min(100%-1.5rem,28rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-md",
          "border-border bg-card shadow-xl"
        )}
      >
        <DialogHeader className="gap-1 pr-8 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <span className="font-heading text-base font-semibold tracking-tight">
              Channel AI
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              #{channelName}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Read-only · nothing is posted for you
          </DialogDescription>
        </DialogHeader>

        {/* Tabs — no tray box; active = underline */}
        <div
          className="-mx-1 flex gap-0.5 overflow-x-auto border-b border-border/60"
          role="tablist"
          aria-label="AI capabilities"
        >
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={busy}
                onClick={() => selectTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-1 border-b-2 px-2.5 py-2 text-xs font-medium transition-colors duration-150",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                  busy && "opacity-60"
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {label}
              </button>
            )
          })}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
          {tab === "summarize" ? (
            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground">
                Distill recent discussion into topics, decisions, and open
                questions.
              </p>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runSummarize()}
                className="btn-brand-gradient gap-2"
              >
                {summarizing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {summarizing ? "Working…" : "Generate summary"}
              </Button>
            </div>
          ) : null}

          {tab === "catch-up" ? (
            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground">
                What changed since a point in time.
              </p>
              <div className="flex flex-wrap gap-2">
                {lastVisitSince ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy}
                    className="btn-brand-gradient gap-1.5"
                    onClick={() =>
                      void runCatchUp(lastVisitSince, "since last visit")
                    }
                  >
                    {catchingUp ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Clock3 className="size-3.5" />
                    )}
                    Since last visit
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  className="gap-1.5"
                  onClick={() =>
                    void runCatchUp(sinceYesterday(), "since yesterday")
                  }
                >
                  {catchingUp && !lastVisitSince ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Clock3 className="size-3.5" />
                  )}
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
            <div className="space-y-2.5">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={busy}
                rows={2}
                maxLength={2000}
                placeholder="Ask about this channel…"
                className={cn(
                  "w-full resize-none rounded-md border border-border bg-transparent px-2.5 py-2 text-sm outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/25"
                )}
              />
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runAsk()}
                className="btn-brand-gradient gap-2"
              >
                {asking ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <MessageCircleQuestion className="size-3.5" />
                )}
                {asking ? "Thinking…" : "Ask"}
              </Button>
            </div>
          ) : null}

          {tab === "draft" ? (
            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground">
                Inserts into the composer — you still click Send.
              </p>
              <div
                className="flex flex-wrap gap-3"
                role="group"
                aria-label="Draft tone"
              >
                {(["concise", "friendly", "formal"] as AiTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={busy}
                    onClick={() => setTone(t)}
                    className={cn(
                      "border-b-2 pb-0.5 text-xs font-medium capitalize transition-colors",
                      tone === t
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runDraft()}
                className="btn-brand-gradient gap-2"
              >
                {drafting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <PenLine className="size-3.5" />
                )}
                {drafting ? "Drafting…" : "Draft into composer"}
              </Button>
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground">
                Markdown notes you can copy — not saved as a Doc.
              </p>
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => void runNotes()}
                className="btn-brand-gradient gap-2"
              >
                {noting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <NotebookPen className="size-3.5" />
                )}
                {noting ? "Writing…" : "Generate notes"}
              </Button>
            </div>
          ) : null}

          {result ? (
            <div
              key={result.slice(0, 24)}
              className="animate-in space-y-1.5 border-t border-border/60 pt-3 duration-200 fade-in-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold">
                    {RESULT_LABEL[resultTab]}
                  </span>
                  {metaLine ? (
                    <span className="text-[11px] text-muted-foreground">
                      {metaLine}
                    </span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void copyResult()}
                  className="h-7 shrink-0 gap-1 px-2 text-xs"
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto text-left text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {result}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
