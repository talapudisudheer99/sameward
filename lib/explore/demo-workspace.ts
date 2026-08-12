/**
 * Static Acme Studio fixtures for the Explore TeamHub demo.
 * Never persisted — ids are not real Mongo ObjectIds.
 */
import type {
  ChannelListItem,
  ChannelMemberRow,
  ChatMessage,
  DmListItem,
} from "@/lib/types/channel/channel-types"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"

export const DEMO_WORKSPACE_ID = "demo-acme"
export const DEMO_WORKSPACE_NAME = "Acme Studio"

/** Exploring user — Jordan (eng), away for part of the thread */
export const DEMO_VIEWER_USER_ID = "demo-user-jordan"

export const DEMO_CHANNEL_IDS = {
  general: "demo-ch-general",
  engineering: "demo-ch-engineering",
  design: "demo-ch-design",
  product: "demo-ch-product",
} as const

export const DEMO_DM_ID = "demo-dm-maya-jordan"

const USERS = {
  maya: { userId: "demo-user-maya", fullName: "Maya Chen", email: "maya@acme.demo" },
  jordan: {
    userId: DEMO_VIEWER_USER_ID,
    fullName: "Jordan Lee",
    email: "jordan@acme.demo",
  },
  sam: { userId: "demo-user-sam", fullName: "Sam Okonkwo", email: "sam@acme.demo" },
  riley: {
    userId: "demo-user-riley",
    fullName: "Riley Park",
    email: "riley@acme.demo",
  },
  alex: { userId: "demo-user-alex", fullName: "Alex Nguyen", email: "alex@acme.demo" },
} as const

/** Mid-timeline cursor — Jordan “left” before the shipping decision landed */
export const DEMO_LAST_VISIT_BY_CHANNEL: Record<string, string | null> = {
  [DEMO_CHANNEL_IDS.product]: "2026-08-09T16:00:00.000Z",
  [DEMO_CHANNEL_IDS.engineering]: "2026-08-09T14:00:00.000Z",
  [DEMO_CHANNEL_IDS.design]: "2026-08-09T15:00:00.000Z",
  [DEMO_CHANNEL_IDS.general]: "2026-08-09T12:00:00.000Z",
  [DEMO_DM_ID]: "2026-08-09T18:00:00.000Z",
}

export const DEMO_EXPLAIN_MESSAGE_IDS = {
  shippingDecision: "demo-msg-product-08",
  designScope: "demo-msg-design-03",
} as const

function msg(
  partial: Omit<ChatMessage, "attachments"> & { attachments?: ChatMessage["attachments"] }
): ChatMessage {
  return { attachments: [], ...partial }
}

const CHANNELS: ChannelListItem[] = [
  {
    id: DEMO_CHANNEL_IDS.general,
    name: "general",
    slug: "general",
    visibility: "public",
    isDefault: true,
    unreadCount: 2,
    lastReadAt: DEMO_LAST_VISIT_BY_CHANNEL[DEMO_CHANNEL_IDS.general]!,
  },
  {
    id: DEMO_CHANNEL_IDS.engineering,
    name: "engineering",
    slug: "engineering",
    visibility: "public",
    isDefault: false,
    unreadCount: 3,
    lastReadAt: DEMO_LAST_VISIT_BY_CHANNEL[DEMO_CHANNEL_IDS.engineering]!,
  },
  {
    id: DEMO_CHANNEL_IDS.design,
    name: "design",
    slug: "design",
    visibility: "public",
    isDefault: false,
    unreadCount: 1,
    lastReadAt: DEMO_LAST_VISIT_BY_CHANNEL[DEMO_CHANNEL_IDS.design]!,
  },
  {
    id: DEMO_CHANNEL_IDS.product,
    name: "product",
    slug: "product",
    visibility: "public",
    isDefault: false,
    unreadCount: 4,
    lastReadAt: DEMO_LAST_VISIT_BY_CHANNEL[DEMO_CHANNEL_IDS.product]!,
  },
]

const DMS: DmListItem[] = [
  {
    id: DEMO_DM_ID,
    peer: { userId: USERS.maya.userId, fullName: USERS.maya.fullName },
    unreadCount: 1,
    lastReadAt: DEMO_LAST_VISIT_BY_CHANNEL[DEMO_DM_ID]!,
  },
]

const WORKSPACE_MEMBERS: WorkspaceMemberOption[] = Object.values(USERS).map(
  (u) => ({
    userId: u.userId,
    fullName: u.fullName,
    email: u.email,
  })
)

const ALL_MEMBERS: ChannelMemberRow[] = WORKSPACE_MEMBERS.map((m) => ({
  ...m,
  online: m.userId === USERS.maya.userId || m.userId === USERS.riley.userId,
}))

const MESSAGES: Record<string, ChatMessage[]> = {
  [DEMO_CHANNEL_IDS.product]: [
    msg({
      id: "demo-msg-product-01",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.riley.userId,
      authorName: USERS.riley.fullName,
      body: "Quick sync: Pulse v1.2 is still targeting Friday. Main question — do we ship unread badges this week or hold for polish?",
      createdAt: "2026-08-09T10:12:00.000Z",
    }),
    msg({
      id: "demo-msg-product-02",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "I’d rather ship badges. Catch-up without a visual cue doesn’t stick for people returning after a day offline.",
      createdAt: "2026-08-09T10:18:00.000Z",
    }),
    msg({
      id: "demo-msg-product-03",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.jordan.userId,
      authorName: USERS.jordan.fullName,
      body: "Eng can land badges by Thu if design locks the badge size today. Mentions are already in review.",
      createdAt: "2026-08-09T10:25:00.000Z",
    }),
    msg({
      id: "demo-msg-product-04",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.sam.userId,
      authorName: USERS.sam.fullName,
      body: "Badge size locked: 10px type, primary fill. I’ll drop the token note in #design.",
      createdAt: "2026-08-09T11:02:00.000Z",
    }),
    msg({
      id: "demo-msg-product-05",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.riley.userId,
      authorName: USERS.riley.fullName,
      body: "Open question for later: should Catch up default to “since last visit” when we have a cursor?",
      createdAt: "2026-08-09T14:40:00.000Z",
    }),
    msg({
      id: "demo-msg-product-06",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Yes — make “Since last visit” the primary action when lastReadAt exists. Yesterday / 7 days stay as secondary.",
      createdAt: "2026-08-09T15:05:00.000Z",
    }),
    msg({
      id: "demo-msg-product-07",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.alex.userId,
      authorName: USERS.alex.fullName,
      body: "One risk: people who never opened a channel would see a huge Catch-up. Confirming we count only others’ messages after first open?",
      createdAt: "2026-08-09T17:20:00.000Z",
      mentionedUserIds: [USERS.maya.userId],
    }),
    msg({
      id: DEMO_EXPLAIN_MESSAGE_IDS.shippingDecision,
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Decision: ship Pulse v1.2 Friday with unread badges + Catch up “since last visit”. Mentions stay as-is. No scope creep into threads.",
      createdAt: "2026-08-09T18:10:00.000Z",
    }),
    msg({
      id: "demo-msg-product-09",
      channelId: DEMO_CHANNEL_IDS.product,
      authorId: USERS.riley.userId,
      authorName: USERS.riley.fullName,
      body: "Locked. I’ll update the release note draft in #general after eng confirms the build.",
      createdAt: "2026-08-09T18:22:00.000Z",
    }),
  ],
  [DEMO_CHANNEL_IDS.engineering]: [
    msg({
      id: "demo-msg-eng-01",
      channelId: DEMO_CHANNEL_IDS.engineering,
      authorId: USERS.alex.userId,
      authorName: USERS.alex.fullName,
      body: "Unread API is up: mark-read returns previousLastReadAt so Catch up can use the prior cursor.",
      createdAt: "2026-08-09T11:30:00.000Z",
    }),
    msg({
      id: "demo-msg-eng-02",
      channelId: DEMO_CHANNEL_IDS.engineering,
      authorId: USERS.jordan.userId,
      authorName: USERS.jordan.fullName,
      body: "I’ll wire sidebar badges this afternoon. Own messages must never increment unread.",
      createdAt: "2026-08-09T11:45:00.000Z",
    }),
    msg({
      id: "demo-msg-eng-03",
      channelId: DEMO_CHANNEL_IDS.engineering,
      authorId: USERS.alex.userId,
      authorName: USERS.alex.fullName,
      body: "Blocked briefly on mobile picker — DM section was missing. Fixing so Explore/mobile match desktop.",
      createdAt: "2026-08-09T16:15:00.000Z",
    }),
    msg({
      id: "demo-msg-eng-04",
      channelId: DEMO_CHANNEL_IDS.engineering,
      authorId: USERS.alex.userId,
      authorName: USERS.alex.fullName,
      body: "Unblocked. Mobile picker shows Direct messages + New DM. Ready for badge QA.",
      createdAt: "2026-08-09T17:50:00.000Z",
    }),
    msg({
      id: "demo-msg-eng-05",
      channelId: DEMO_CHANNEL_IDS.engineering,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Thanks — product decision is Friday ship. Please don’t pull threads into this release.",
      createdAt: "2026-08-09T18:30:00.000Z",
      mentionedUserIds: [USERS.alex.userId, USERS.jordan.userId],
    }),
  ],
  [DEMO_CHANNEL_IDS.design]: [
    msg({
      id: "demo-msg-design-01",
      channelId: DEMO_CHANNEL_IDS.design,
      authorId: USERS.sam.userId,
      authorName: USERS.sam.fullName,
      body: "Unread badge: primary pill, tabular nums, 99+ cap. Matches channel list density.",
      createdAt: "2026-08-09T11:10:00.000Z",
    }),
    msg({
      id: "demo-msg-design-02",
      channelId: DEMO_CHANNEL_IDS.design,
      authorId: USERS.riley.userId,
      authorName: USERS.riley.fullName,
      body: "Can we keep the demo banner calm — label + one sentence, not a feature checklist?",
      createdAt: "2026-08-09T13:20:00.000Z",
    }),
    msg({
      id: DEMO_EXPLAIN_MESSAGE_IDS.designScope,
      channelId: DEMO_CHANNEL_IDS.design,
      authorId: USERS.sam.userId,
      authorName: USERS.sam.fullName,
      body: "Agreed. Banner = “TeamHub Demo” + stay-on-the-same-page line + Create CTA. No checklist of Chat/AI/DMs.",
      createdAt: "2026-08-09T13:35:00.000Z",
    }),
    msg({
      id: "demo-msg-design-04",
      channelId: DEMO_CHANNEL_IDS.design,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Looks good. Ship those tokens with v1.2.",
      createdAt: "2026-08-09T18:40:00.000Z",
    }),
  ],
  [DEMO_CHANNEL_IDS.general]: [
    msg({
      id: "demo-msg-gen-01",
      channelId: DEMO_CHANNEL_IDS.general,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Welcome to Acme Studio on TeamHub — use channels for shared context, DMs for 1:1, and Channel AI when you need to catch up.",
      createdAt: "2026-08-08T09:00:00.000Z",
    }),
    msg({
      id: "demo-msg-gen-02",
      channelId: DEMO_CHANNEL_IDS.general,
      authorId: USERS.riley.userId,
      authorName: USERS.riley.fullName,
      body: "Release note draft: Pulse v1.2 — unread badges, Catch up since last visit, mobile DMs. Friday.",
      createdAt: "2026-08-09T19:05:00.000Z",
    }),
    msg({
      id: "demo-msg-gen-03",
      channelId: DEMO_CHANNEL_IDS.general,
      authorId: USERS.sam.userId,
      authorName: USERS.sam.fullName,
      body: "Design tokens are in. Ping me if badge contrast looks off in dark mode.",
      createdAt: "2026-08-09T19:12:00.000Z",
    }),
  ],
  [DEMO_DM_ID]: [
    msg({
      id: "demo-msg-dm-01",
      channelId: DEMO_DM_ID,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Jordan — before standup tomorrow, skim #product. We locked Friday ship while you were out.",
      createdAt: "2026-08-09T18:45:00.000Z",
    }),
    msg({
      id: "demo-msg-dm-02",
      channelId: DEMO_DM_ID,
      authorId: USERS.jordan.userId,
      authorName: USERS.jordan.fullName,
      body: "Thanks — I’ll use Catch up on #product first so I don’t miss the decision thread.",
      createdAt: "2026-08-09T19:00:00.000Z",
    }),
    msg({
      id: "demo-msg-dm-03",
      channelId: DEMO_DM_ID,
      authorId: USERS.maya.userId,
      authorName: USERS.maya.fullName,
      body: "Perfect. If anything’s unclear, Explain on the decision message — that’s the source of truth.",
      createdAt: "2026-08-09T19:08:00.000Z",
    }),
  ],
}

export function getDemoChannels(): ChannelListItem[] {
  return CHANNELS
}

export function getDemoDms(): DmListItem[] {
  return DMS
}

export function getDemoWorkspaceMembers(): WorkspaceMemberOption[] {
  return WORKSPACE_MEMBERS
}

export function getDemoChannelMembers(): ChannelMemberRow[] {
  return ALL_MEMBERS
}

export function getDemoMessages(channelId: string): ChatMessage[] {
  return MESSAGES[channelId] ?? []
}

export function getDemoActiveChannel(channelId: string): ChannelListItem | null {
  const channel = CHANNELS.find((c) => c.id === channelId)
  if (channel) return channel
  const dm = DMS.find((d) => d.id === channelId)
  if (!dm) return null
  return {
    id: dm.id,
    name: dm.peer.fullName,
    slug: `dm-${dm.id}`,
    visibility: "dm",
    isDefault: false,
    unreadCount: dm.unreadCount,
    lastReadAt: dm.lastReadAt,
    peer: dm.peer,
  }
}

export function getDemoLastVisitSince(channelId: string): string | null {
  return DEMO_LAST_VISIT_BY_CHANNEL[channelId] ?? null
}

export function getDefaultDemoChannelId(): string {
  return DEMO_CHANNEL_IDS.product
}
