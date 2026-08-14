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

const ALLOWED_SET = new Set<string>(ALLOWED_ATTACHMENT_MIMES)

export function isAllowedAttachmentMime(mime: string): boolean {
  return ALLOWED_SET.has(mime)
}

export type AttachmentPickResult = {
  accepted: File[]
  error: string | null
}

/**
 * Filter dropped / picked files against attachment limits.
 * `alreadyCount` = files already queued on the composer.
 */
export function pickAttachmentFiles(
  incoming: Iterable<File>,
  alreadyCount = 0
): AttachmentPickResult {
  const accepted: File[] = []
  let error: string | null = null
  let count = alreadyCount

  for (const file of incoming) {
    if (count >= MAX_ATTACHMENTS_PER_MESSAGE) {
      error = `Max ${MAX_ATTACHMENTS_PER_MESSAGE} files`
      break
    }
    if (!isAllowedAttachmentMime(file.type)) {
      error = "Only images (jpeg/png/webp/gif) and PDF"
      continue
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      error = "Each file must be 10MB or less"
      continue
    }
    accepted.push(file)
    count += 1
  }

  return { accepted, error }
}
