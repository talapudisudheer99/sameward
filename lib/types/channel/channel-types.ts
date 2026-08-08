/**
 * Shared channel/chat types — match API JSON (no Mongoose in Client Components).
 * `lib/types/<module>/…`
 */
import type { Attachment } from "@/lib/types/upload/upload-types"

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
  attachments: Attachment[]
  createdAt: string // ISO
  pending?: boolean
  failed?: boolean
}

/** GET …/messages?cursor=&limit= */
export type MessagesListResponse = {
  messages: ChatMessage[]
  nextCursor: string | null
}

/** POST …/messages body — text and/or attachments (uploaded to S3 first). */
export type CreateMessageRequest = {
  body: string
  attachments?: Attachment[]
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
