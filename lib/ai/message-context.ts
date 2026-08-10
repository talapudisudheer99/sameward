import { Types } from "mongoose"

import {
  AI_DEFAULT_MESSAGE_LIMIT,
  AI_MAX_CONTEXT_CHARS,
  AI_MAX_MESSAGE_LIMIT,
  AI_NEIGHBOR_COUNT,
} from "@/lib/ai/constants"
import { Message } from "@/lib/models/channel/message"
import { User } from "@/lib/models/user"

export type ContextMessage = {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
  attachmentNames: string[]
}

export type MessageContextResult = {
  messages: ContextMessage[]
  /** Oldest→newest transcript block for the prompt */
  formatted: string
  truncated: boolean
  messageCount: number
}

function clampLimit(limit?: number): number {
  if (limit == null || !Number.isFinite(limit)) return AI_DEFAULT_MESSAGE_LIMIT
  return Math.min(Math.max(Math.trunc(limit), 1), AI_MAX_MESSAGE_LIMIT)
}

function formatOne(m: ContextMessage): string {
  const files =
    m.attachmentNames.length > 0
      ? ` [files: ${m.attachmentNames.join(", ")}]`
      : ""
  const body = m.body.trim() || "(no text)"
  return `[${m.createdAt}] ${m.authorName}: ${body}${files}`
}

function toContextMessage(
  doc: {
    _id: { toString(): string }
    authorId: { toString(): string }
    body: string
    attachments?: { name: string }[]
    createdAt: Date
  },
  authorName: string
): ContextMessage {
  return {
    id: doc._id.toString(),
    authorId: doc.authorId.toString(),
    authorName,
    body: doc.body ?? "",
    createdAt: doc.createdAt.toISOString(),
    attachmentNames: (doc.attachments ?? []).map((a) => a.name),
  }
}

async function resolveAuthorNames(
  authorIds: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(authorIds)]
  const objectIds = unique
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id))

  const users = await User.find({ _id: { $in: objectIds } })
    .select("fullName")
    .lean()

  const map = new Map<string, string>()
  for (const u of users) {
    map.set(u._id.toString(), u.fullName || "Unknown")
  }
  return map
}

/**
 * Apply char budget: drop oldest first, keep newest.
 */
function applyCharBudget(messages: ContextMessage[]): {
  messages: ContextMessage[]
  truncated: boolean
} {
  let truncated = false
  let total = messages.reduce((n, m) => n + formatOne(m).length + 1, 0)
  if (total <= AI_MAX_CONTEXT_CHARS) {
    return { messages, truncated: false }
  }

  truncated = true
  const kept = [...messages]
  while (kept.length > 1 && total > AI_MAX_CONTEXT_CHARS) {
    const removed = kept.shift()!
    total -= formatOne(removed).length + 1
  }
  return { messages: kept, truncated }
}

/**
 * Load newest `limit` messages for a channel (already access-checked).
 * Returns oldest→newest for the prompt.
 */
export async function loadRecentChannelContext(
  channelId: string,
  limit?: number
): Promise<MessageContextResult> {
  const capped = clampLimit(limit)
  const docs = await Message.find({ channelId })
    .sort({ createdAt: -1 })
    .limit(capped)
    .lean()

  const chronological = [...docs].reverse()
  const nameMap = await resolveAuthorNames(
    chronological.map((d) => d.authorId.toString())
  )

  const mapped = chronological.map((d) =>
    toContextMessage(d, nameMap.get(d.authorId.toString()) ?? "Unknown")
  )
  const { messages, truncated } = applyCharBudget(mapped)

  return {
    messages,
    formatted: messages.map(formatOne).join("\n"),
    truncated,
    messageCount: messages.length,
  }
}

/**
 * Load messages with createdAt >= since (capped to newest `limit` in that window).
 */
export async function loadSinceChannelContext(
  channelId: string,
  since: Date,
  limit?: number
): Promise<MessageContextResult> {
  const capped = clampLimit(limit)
  const docs = await Message.find({
    channelId,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: -1 })
    .limit(capped)
    .lean()

  const chronological = [...docs].reverse()
  const nameMap = await resolveAuthorNames(
    chronological.map((d) => d.authorId.toString())
  )

  const mapped = chronological.map((d) =>
    toContextMessage(d, nameMap.get(d.authorId.toString()) ?? "Unknown")
  )
  const { messages, truncated } = applyCharBudget(mapped)

  return {
    messages,
    formatted: messages.map(formatOne).join("\n"),
    truncated,
    messageCount: messages.length,
  }
}

/**
 * Target message + ± neighbors in the same channel.
 */
export async function loadExplainContext(
  channelId: string,
  messageId: string
): Promise<MessageContextResult | null> {
  if (!Types.ObjectId.isValid(messageId)) return null

  const target = await Message.findOne({
    _id: messageId,
    channelId,
  }).lean()
  if (!target) return null

  const before = await Message.find({
    channelId,
    createdAt: { $lt: target.createdAt },
  })
    .sort({ createdAt: -1 })
    .limit(AI_NEIGHBOR_COUNT)
    .lean()

  const after = await Message.find({
    channelId,
    createdAt: { $gt: target.createdAt },
  })
    .sort({ createdAt: 1 })
    .limit(AI_NEIGHBOR_COUNT)
    .lean()

  const chronological = [...before.reverse(), target, ...after]
  const nameMap = await resolveAuthorNames(
    chronological.map((d) => d.authorId.toString())
  )

  const mapped = chronological.map((d) =>
    toContextMessage(d, nameMap.get(d.authorId.toString()) ?? "Unknown")
  )
  const { messages, truncated } = applyCharBudget(mapped)

  return {
    messages,
    formatted: messages.map(formatOne).join("\n"),
    truncated,
    messageCount: messages.length,
  }
}
