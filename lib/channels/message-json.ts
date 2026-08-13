import { presignAttachmentGet } from "@/lib/storage/s3"
import type { LinkPreview } from "@/lib/types/channel/link-preview"

export type MessageReactionJson = {
  emoji: string
  count: number
  userIds: string[]
}

/**
 * Shared message JSON for GET history, POST create, PATCH edit, DELETE tombstone.
 * Attachment URLs are signed for the client; Mongo keeps canonical private URLs.
 */
export type ChatMessageJson = {
  id: string
  channelId: string
  authorId: string
  authorName: string
  body: string
  attachments: {
    url: string
    name: string
    mime: string
    sizeBytes: number
  }[]
  mentionedUserIds: string[]
  reactions: MessageReactionJson[]
  linkPreviews: LinkPreview[]
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  deletedBy: string | null
}

type MessageLike = {
  _id: { toString(): string }
  channelId: { toString(): string }
  authorId: { toString(): string }
  body: string
  attachments?: {
    url: string
    name: string
    mime: string
    sizeBytes: number
  }[]
  mentionedUserIds?: { toString(): string }[]
  reactions?: {
    emoji: string
    userIds?: { toString(): string }[]
  }[]
  /** Mongoose DocumentArray or plain objects — normalized in mapLinkPreviews */
  linkPreviews?: unknown
  createdAt: Date
  editedAt?: Date | null
  deletedAt?: Date | null
  deletedBy?: { toString(): string } | null
}

function mapReactions(
  reactions: MessageLike["reactions"]
): MessageReactionJson[] {
  return (reactions ?? [])
    .map((r) => {
      const userIds = (r.userIds ?? []).map((id) => id.toString())
      return {
        emoji: r.emoji,
        count: userIds.length,
        userIds,
      }
    })
    .filter((r) => r.count > 0)
}

function mapLinkPreviews(previews: unknown): LinkPreview[] {
  if (!Array.isArray(previews)) return []
  return previews
    .map((raw) => {
      const p = raw as Record<string, unknown>
      if (
        typeof p.url !== "string" ||
        typeof p.finalUrl !== "string" ||
        typeof p.title !== "string"
      ) {
        return null
      }
      return {
        url: p.url,
        finalUrl: p.finalUrl,
        title: p.title,
        description: typeof p.description === "string" ? p.description : null,
        imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : null,
        siteName: typeof p.siteName === "string" ? p.siteName : null,
        faviconUrl: typeof p.faviconUrl === "string" ? p.faviconUrl : null,
      } satisfies LinkPreview
    })
    .filter((p): p is LinkPreview => p != null)
}

export async function toMessageJson(
  doc: MessageLike,
  authorName: string
): Promise<ChatMessageJson> {
  const deletedAt = doc.deletedAt ?? null

  // Soft-deleted rows never leak body/attachments/reactions/previews
  if (deletedAt) {
    return {
      id: doc._id.toString(),
      channelId: doc.channelId.toString(),
      authorId: doc.authorId.toString(),
      authorName,
      body: "",
      attachments: [],
      mentionedUserIds: [],
      reactions: [],
      linkPreviews: [],
      createdAt: doc.createdAt.toISOString(),
      editedAt: doc.editedAt ? doc.editedAt.toISOString() : null,
      deletedAt: deletedAt.toISOString(),
      deletedBy: doc.deletedBy ? doc.deletedBy.toString() : null,
    }
  }

  const attachments = await Promise.all(
    (doc.attachments ?? []).map(async (a) => ({
      url: await presignAttachmentGet(a.url),
      name: a.name,
      mime: a.mime,
      sizeBytes: a.sizeBytes,
    }))
  )

  return {
    id: doc._id.toString(),
    channelId: doc.channelId.toString(),
    authorId: doc.authorId.toString(),
    authorName,
    body: doc.body,
    attachments,
    mentionedUserIds: (doc.mentionedUserIds ?? []).map((id) => id.toString()),
    reactions: mapReactions(doc.reactions),
    linkPreviews: mapLinkPreviews(doc.linkPreviews),
    createdAt: doc.createdAt.toISOString(),
    editedAt: doc.editedAt ? doc.editedAt.toISOString() : null,
    deletedAt: null,
    deletedBy: null,
  }
}
