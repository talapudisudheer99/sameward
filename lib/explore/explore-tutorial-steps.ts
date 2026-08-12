export type ExploreTutorialStepId =
  | "welcome"
  | "demo-banner"
  | "channels"
  | "conversation"
  | "explain"
  | "channel-ai"
  | "dms"
  | "create"

export type ExploreTutorialStep = {
  id: ExploreTutorialStepId
  title: string
  body: string
  /** CSS selector for spotlight; omit = centered card only */
  target?: string
  placement?: "top" | "bottom" | "left" | "right" | "center"
}

export const EXPLORE_TUTORIAL_STORAGE_KEY = "teamhub-explore-tutorial-v1"

export const EXPLORE_TUTORIAL_STEPS: ExploreTutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to TeamHub",
    body: "You’re inside Acme Studio — a sample team workspace. In about a minute we’ll show how TeamHub helps people understand conversations and stay on the same page.",
    placement: "center",
  },
  {
    id: "demo-banner",
    title: "This is a safe demo",
    body: "Nothing here is saved to your account. Browse freely — when you’re ready, create your own workspace for your team.",
    target: '[data-explore-tutorial="demo-banner"]',
    placement: "bottom",
  },
  {
    id: "channels",
    title: "Channels organize team talk",
    body: "Each # channel is a topic — product, engineering, design. Switch channels to follow different threads. Blue badges show unread messages you missed.",
    target: '[data-explore-tutorial="channels-list"]',
    placement: "right",
  },
  {
    id: "conversation",
    title: "Read the conversation",
    body: "You’re Jordan, an engineer who was away. Scroll the thread in #product to see how the team debated a release — decisions, questions, and replies over time.",
    target: '[data-explore-tutorial="transcript"]',
    placement: "left",
  },
  {
    id: "explain",
    title: "Explain one message",
    body: "Confused by a single line? Hover a message and tap the sparkle — AI explains that message using nearby context.",
    target: '[data-explore-tutorial="explain-button"]',
    placement: "left",
  },
  {
    id: "channel-ai",
    title: "Catch up on the whole channel",
    body: "Open Channel AI for Summarize or Catch up — especially “Since last visit” when you’ve been away. That’s TeamHub’s core value.",
    target: '[data-explore-tutorial="channel-ai"]',
    placement: "bottom",
  },
  {
    id: "dms",
    title: "Direct messages too",
    body: "Not everything belongs in a channel. DMs are private 1:1 — same chat and AI, smaller audience.",
    target: '[data-explore-tutorial="dms-list"]',
    placement: "right",
  },
  {
    id: "create",
    title: "Bring your team here",
    body: "When this clicks, create your workspace. Your team gets channels, DMs, unread, and Channel AI on your real conversations.",
    target: '[data-explore-tutorial="create-cta"]',
    placement: "top",
  },
]
