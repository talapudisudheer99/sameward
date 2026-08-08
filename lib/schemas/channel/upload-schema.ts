import { z } from "zod"

import {
  ALLOWED_ATTACHMENT_MIMES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/channels/attachment-limits"

/**
 * One file the client wants to upload. We validate metadata only — the bytes
 * go straight to S3 via the presigned URL. `sizeBytes` is a client claim we
 * trust for v1 (presigned PUT can't enforce size); see TASKS orphan/limits note.
 */
const uploadFileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "File name is required" })
    .max(255, { message: "File name is too long" }),
  mime: z.enum(ALLOWED_ATTACHMENT_MIMES, { message: "File type not allowed" }),
  sizeBytes: z
    .number()
    .int({ message: "sizeBytes must be an integer" })
    .min(1, { message: "File cannot be empty" })
    .max(MAX_ATTACHMENT_BYTES, { message: "Each file must be 10MB or less" }),
})

/**
 * Batch presign request — validate all selected files together, then sign one
 * PUT URL per file.
 */
const uploadRequestSchema = z.object({
  files: z
    .array(uploadFileSchema)
    .min(1, { message: "At least one file is required" })
    .max(MAX_ATTACHMENTS_PER_MESSAGE, {
      message: `At most ${MAX_ATTACHMENTS_PER_MESSAGE} files per message`,
    }),
})

export default uploadRequestSchema
export type UploadRequest = z.infer<typeof uploadRequestSchema>
export type UploadFile = z.infer<typeof uploadFileSchema>
