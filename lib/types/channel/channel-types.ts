/**
 * Shared channel/chat types — match API JSON (no Mongoose in Client Components).
 * `lib/types/<module>/…`
 */

export type ChannelVisibility = "public" | "private"

/** Same string values as `lib/models/channel/channel` ChannelVisibility */
export enum ChannelVisibilityEnum {
  Public = "public",
  Private = "private",
}

export type ChannelListItem = {
  id: string
  name: string
  slug: string
  visibility: ChannelVisibility
  isDefault: boolean
}

export type ChatAttachment = {
  url: string
  name: string
  mime: string
  sizeBytes: number
}

/**
 * One message in the transcript / POST response.
 * Matches GET/POST …/messages JSON (server fields).
 * `pending` / `failed` are client-only (optimistic UI later).
 */
export type ChatMessage = {
  id: string
  channelId: string
  authorId: string
  authorName: string
  body: string
  attachments: ChatAttachment[]
  createdAt: string // ISO
  pending?: boolean
  failed?: boolean
}

/** GET …/messages?cursor=&limit= */
export type MessagesListResponse = {
  messages: ChatMessage[]
  nextCursor: string | null
}

/** POST …/messages body (T12 text-only; attachments ignored until S3) */
export type CreateMessageRequest = {
  body: string
  clientMessageId?: string
}

/** POST …/messages → 201 / idempotent 200 — same shape as a list item */
export type CreateMessageResponse = ChatMessage

export type ChannelMemberRow = {
  userId: string
  fullName: string
  email: string
  online?: boolean
}
