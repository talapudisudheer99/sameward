/**
 * Single source of truth for chat attachment limits (PO lock: VISION.md).
 * Server (Zod + presign route) and client (composer) both derive from here so
 * the rules can never drift apart.
 */
export const MAX_ATTACHMENTS_PER_MESSAGE = 3

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024 // 10 MB

export const ALLOWED_ATTACHMENT_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const

export type AllowedAttachmentMime = (typeof ALLOWED_ATTACHMENT_MIMES)[number]
