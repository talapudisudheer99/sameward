/**
 * Canned Channel AI responses for the Explore demo (no OpenAI).
 */
import type { AiResponse, AiTone } from "@/lib/types/ai/ai-types"
import {
  DEMO_CHANNEL_IDS,
  DEMO_DM_ID,
  DEMO_EXPLAIN_MESSAGE_IDS,
  getDemoMessages,
} from "@/lib/explore/demo-workspace"

function pack(text: string, channelId: string, since: string | null = null): AiResponse {
  const count = getDemoMessages(channelId).length
  return {
    text: text.trim(),
    meta: {
      messageCount: count,
      truncated: false,
      since,
      model: "demo",
    },
  }
}

async function pause(ms = 280): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

const SUMMARIES: Record<string, string> = {
  [DEMO_CHANNEL_IDS.product]: `## Topics
- Pulse v1.2 Friday release scope
- Unread badges vs holding for polish
- Catch up defaulting to “since last visit”

## Decisions
- Ship Friday with unread badges + Catch up “since last visit”
- Mentions stay as-is; no threads in this release

## Open questions
- None blocking — Alex confirmed unread counting rules for never-opened channels`,

  [DEMO_CHANNEL_IDS.engineering]: `## Topics
- Unread mark-read API (previousLastReadAt)
- Sidebar badges (exclude own messages)
- Mobile picker DM section fix

## Decisions
- Friday ship confirmed from product; no threads in scope

## Open questions
- Badge QA still pending after mobile fix`,

  [DEMO_CHANNEL_IDS.design]: `## Topics
- Unread badge visual tokens
- Demo banner tone (value story, not feature checklist)

## Decisions
- Badge: primary pill, 10px, 99+ cap
- Demo banner: label + one sentence + Create CTA

## Open questions
- Dark-mode contrast check if needed`,

  [DEMO_CHANNEL_IDS.general]: `## Topics
- Team welcome on Sameward
- Pulse v1.2 release note draft (Friday)

## Decisions
- Release messaging: unread badges, Catch up since last visit, mobile DMs

## Open questions
- None`,

  [DEMO_DM_ID]: `## Topics
- Maya tipped Jordan to catch up on #product after being away
- Use Catch up + Explain on the decision message

## Decisions
- Jordan will Catch up on #product before standup

## Open questions
- None`,
}

const CATCH_UP: Record<string, string> = {
  [DEMO_CHANNEL_IDS.product]: `While you were away:

1. Alex asked how unread works for never-opened channels (only others’ messages after first open).
2. Maya locked the shipping decision: Pulse v1.2 Friday with unread badges + Catch up “since last visit”; no threads.
3. Riley will update the #general release note after eng confirms the build.

You can contribute by confirming badge QA or asking about the never-opened-channel rule — the decision itself is settled.`,

  [DEMO_CHANNEL_IDS.engineering]: `While you were away:

1. Alex unblocked the mobile DM picker.
2. Maya confirmed Friday ship and asked eng not to pull threads into the release.

Next useful move: finish badge QA on the unread API Alex landed.`,

  [DEMO_CHANNEL_IDS.design]: `While you were away:

Maya approved shipping the badge tokens with v1.2. Banner copy stays value-first (no feature checklist).`,

  [DEMO_CHANNEL_IDS.general]: `While you were away:

Riley posted the Pulse v1.2 release note draft; Sam noted design tokens are in and asked for dark-mode badge feedback if needed.`,

  [DEMO_DM_ID]: `While you were away:

Maya followed up: use Explain on the #product decision message if anything is unclear after Catch up.`,
}

const EXPLAIN: Record<string, string> = {
  [DEMO_EXPLAIN_MESSAGE_IDS.shippingDecision]: `Maya is closing the debate into a clear ship plan.

Context: the team weighed shipping unread badges this week vs delaying. Eng said badges were feasible by Thursday once design locked size; Sam locked tokens; Riley asked how Catch up should default.

Meaning: Friday’s Pulse v1.2 includes unread badges and Catch up “since last visit”. Mentions stay. Threads are explicitly out of scope so the release stays focused.

Why it matters: anyone returning cold (like Jordan) can treat this message as the source of truth instead of re-reading the whole thread.`,

  [DEMO_EXPLAIN_MESSAGE_IDS.designScope]: `Sam is agreeing with Riley’s product/design principle for the Explore experience.

They’re saying the demo banner should teach the value (“stay on the same page”) with a Create CTA — not a checklist of Chat, AI, DMs, etc. That keeps the demo aligned with Sameward’s differentiator: understanding conversations, not listing features.`,
}

export async function demoSummarize(channelId: string): Promise<AiResponse> {
  await pause()
  return pack(
    SUMMARIES[channelId] ??
      "This demo channel has a short sample thread about staying aligned as a team.",
    channelId
  )
}

export async function demoCatchUp(
  channelId: string,
  since: string
): Promise<AiResponse> {
  await pause()
  return pack(
    CATCH_UP[channelId] ??
      "Nothing major changed in this sample window — open #product to see a full Catch-up example.",
    channelId,
    since
  )
}

export async function demoAsk(
  channelId: string,
  question: string
): Promise<AiResponse> {
  await pause()
  const q = question.toLowerCase()
  let text: string
  if (q.includes("friday") || q.includes("ship") || q.includes("release")) {
    text =
      "From this channel’s thread: Pulse v1.2 ships Friday with unread badges and Catch up “since last visit”. Threads are out of scope for this release."
  } else if (q.includes("unread") || q.includes("badge")) {
    text =
      "Unread badges are in scope for Friday. Eng wires counts from lastReadAt; own messages never count as unread. Design locked a primary pill badge."
  } else if (q.includes("jordan") || q.includes("away") || q.includes("miss")) {
    text =
      "Jordan (you in this demo) was away during the final decision. Catch up on #product since last visit covers Alex’s question, Maya’s decision, and Riley’s release-note follow-up."
  } else {
    text = `Based on the sample #${channelId.replace("demo-ch-", "") || "dm"} conversation: the team is aligning on Pulse v1.2 so people can catch up without re-reading everything. Try asking about “Friday ship” or “unread badges”.`
  }
  return pack(text, channelId)
}

export async function demoDraft(
  channelId: string,
  tone: AiTone
): Promise<AiResponse> {
  await pause()
  const drafts: Record<AiTone, string> = {
    concise:
      "Sounds good — I’ll confirm badge QA against the unread API before Friday.",
    friendly:
      "Thanks for locking this! I’ll double-check unread badges today so we’re solid for Friday’s ship.",
    formal:
      "Acknowledged. I will verify unread badge behavior against the mark-read API prior to the Friday release.",
  }
  return pack(drafts[tone], channelId)
}

export async function demoNotes(channelId: string): Promise<AiResponse> {
  await pause()
  return pack(
    `### Meeting notes (sample)
**Channel:** ${channelId}
**Focus:** Stay aligned on Pulse v1.2

- **Goal:** Ship a release where returning members can understand what they missed
- **Decision:** Friday ship — unread + Catch up since last visit
- **Out of scope:** Threads
- **Follow-ups:** Badge QA (eng), release note in #general (Riley)`,
    channelId
  )
}

export async function demoExplain(messageId: string): Promise<AiResponse> {
  await pause()
  const text =
    EXPLAIN[messageId] ??
    "In this demo, try Explain on Maya’s shipping decision in #product or Sam’s banner note in #design — those messages carry the key context."
  return {
    text,
    meta: {
      messageCount: 3,
      truncated: false,
      since: null,
      model: "demo",
    },
  }
}
