"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import ChannelChatShell from "@/components/channel/channel-chat-shell"
import ExploreDemoBanner from "@/components/explore/explore-demo-banner"
import ExploreEndCta from "@/components/explore/explore-end-cta"
import ExploreTutorial from "@/components/explore/explore-tutorial"
import CreateWorkSpaceDialog from "@/components/dialogs/workspace/create-work-space-dialog"
import {
  demoAsk,
  demoCatchUp,
  demoDraft,
  demoExplain,
  demoNotes,
  demoSummarize,
} from "@/lib/explore/demo-ai-responses"
import type { ChannelAiRunner } from "@/lib/explore/ai-runners"
import {
  EXPLORE_TUTORIAL_STORAGE_KEY,
  type ExploreTutorialStep,
} from "@/lib/explore/explore-tutorial-steps"
import {
  DEMO_CHANNEL_IDS,
  DEMO_EXPLAIN_MESSAGE_IDS,
  DEMO_VIEWER_USER_ID,
  DEMO_WORKSPACE_ID,
  getDefaultDemoChannelId,
  getDemoActiveChannel,
  getDemoChannelMembers,
  getDemoChannels,
  getDemoDms,
  getDemoLastVisitSince,
  getDemoMessages,
  getDemoWorkspaceMembers,
} from "@/lib/explore/demo-workspace"
import { useGetWorkspacesQuery } from "@/store/api/workspace/workspaces-api"

const DEMO_NUDGE =
  "This is a read-only demo. Create your workspace to start talking with your team."

/**
 * Explore Sameward — static Acme Studio demo (no Mongo / no live AI).
 */
export default function ExplorePage() {
  const router = useRouter()
  const { data: workspacesData } = useGetWorkspacesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    getDefaultDemoChannelId()
  )
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [pinExplainId, setPinExplainId] = useState<string | undefined>()
  const creatingRef = useRef(false)
  const baselineCount = useRef(workspacesData?.workspaces.length ?? 0)

  useEffect(() => {
    const n = workspacesData?.workspaces.length ?? 0
    if (!creatingRef.current) {
      baselineCount.current = n
      return
    }
    if (n > baselineCount.current) {
      creatingRef.current = false
      router.replace("/workspace")
    }
  }, [workspacesData, router])

  useEffect(() => {
    try {
      const done = localStorage.getItem(EXPLORE_TUTORIAL_STORAGE_KEY)
      if (!done) {
        const t = window.setTimeout(() => setTutorialOpen(true), 400)
        return () => window.clearTimeout(t)
      }
    } catch {
      setTutorialOpen(true)
    }
  }, [])

  const finishTutorial = useCallback((status: "done" | "skipped") => {
    try {
      localStorage.setItem(EXPLORE_TUTORIAL_STORAGE_KEY, status)
    } catch {
      /* private mode */
    }
    setTutorialOpen(false)
    setPinExplainId(undefined)
  }, [])

  const handleTutorialStep = useCallback((step: ExploreTutorialStep) => {
    switch (step.id) {
      case "channels":
        if (window.matchMedia("(max-width: 767px)").matches) {
          setActiveChannelId(null)
        }
        setPinExplainId(undefined)
        break
      case "conversation":
      case "channel-ai":
        setActiveChannelId(DEMO_CHANNEL_IDS.product)
        setPinExplainId(undefined)
        break
      case "explain":
        setActiveChannelId(DEMO_CHANNEL_IDS.product)
        setPinExplainId(DEMO_EXPLAIN_MESSAGE_IDS.shippingDecision)
        window.setTimeout(() => {
          document
            .querySelector('[data-explore-tutorial="explain-button"]')
            ?.scrollIntoView({ block: "center", behavior: "smooth" })
        }, 200)
        break
      case "dms":
        setPinExplainId(undefined)
        if (window.matchMedia("(max-width: 767px)").matches) {
          setActiveChannelId(null)
        }
        break
      default:
        setPinExplainId(undefined)
        break
    }
  }, [])

  function replayTour() {
    setTutorialStep(0)
    setTutorialOpen(true)
    setActiveChannelId(getDefaultDemoChannelId())
    setPinExplainId(undefined)
  }

  const channels = useMemo(() => getDemoChannels(), [])
  const dms = useMemo(() => getDemoDms(), [])
  const workspaceMembers = useMemo(() => getDemoWorkspaceMembers(), [])
  const channelMembers = useMemo(() => getDemoChannelMembers(), [])

  const activeChannel = activeChannelId
    ? getDemoActiveChannel(activeChannelId)
    : null
  const messages = activeChannelId ? getDemoMessages(activeChannelId) : []
  const lastVisitSince = activeChannelId
    ? getDemoLastVisitSince(activeChannelId)
    : null

  const aiRunner: ChannelAiRunner | undefined = activeChannelId
    ? {
        summarize: () => demoSummarize(activeChannelId),
        catchUp: (since) => demoCatchUp(activeChannelId, since),
        ask: (question) => demoAsk(activeChannelId, question),
        draft: (tone) => demoDraft(activeChannelId, tone),
        notes: () => demoNotes(activeChannelId),
      }
    : undefined

  function nudge() {
    toast.message(DEMO_NUDGE, {
      action: {
        label: "Create workspace",
        onClick: () => setCreateOpen(true),
      },
    })
  }

  async function rejectDemoAction(): Promise<void> {
    nudge()
    throw new Error("demo_readonly")
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ExploreDemoBanner
        onCreateWorkspace={() => setCreateOpen(true)}
        onReplayTour={replayTour}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <ChannelChatShell
          workspaceId={DEMO_WORKSPACE_ID}
          channels={channels}
          dms={dms}
          workspaceMembers={workspaceMembers}
          activeChannel={activeChannel}
          messages={messages}
          channelMembers={channelMembers}
          inviteCandidates={[]}
          currentUserId={DEMO_VIEWER_USER_ID}
          canManage={false}
          demoMode
          lastVisitSince={lastVisitSince}
          onSelectChannel={setActiveChannelId}
          onBackToList={() => setActiveChannelId(null)}
          aiRunner={aiRunner}
          explainRunner={demoExplain}
          tutorialPinExplainMessageId={pinExplainId}
          onCreateChannel={rejectDemoAction}
          onRenameChannel={rejectDemoAction}
          onDeleteChannel={rejectDemoAction}
          onInviteMembers={rejectDemoAction}
          onSendMessage={rejectDemoAction}
        />
      </div>

      <ExploreEndCta onCreateWorkspace={() => setCreateOpen(true)} />

      <ExploreTutorial
        open={tutorialOpen}
        stepIndex={tutorialStep}
        onStepChange={setTutorialStep}
        onStepEnter={handleTutorialStep}
        onSkip={() => finishTutorial("skipped")}
        onComplete={() => finishTutorial("done")}
      />

      <CreateWorkSpaceDialog
        open={createOpen}
        onOpenChange={(open) => {
          if (open) creatingRef.current = true
          setCreateOpen(open)
        }}
        showTrigger={false}
      />
    </div>
  )
}
