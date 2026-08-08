/**
 * Upload / presign types — shared by the upload RTK slice and any feature that
 * needs to push a file to storage (chat attachments now; avatars, etc. later).
 * Vendor-agnostic on purpose: callers only see "get a URL, PUT the bytes".
 */

type Attachment = {
  url: string
  name: string
  mime: string
  sizeBytes: number
}

/** What the client knows about a file before uploading (metadata only). */
export type PresignFileInput = {
  name: string
  mime: string
  sizeBytes: number
}

/**
 * One signed slot returned by the presign endpoint.
 * - `uploadUrl` — PUT the raw bytes here (short-lived).
 * - `url` — canonical object URL to persist on the message.
 * - `key` — S3 object key (kept for presigned GET / delete later).
 * Extends ChatAttachment so, after upload, we drop `key`/`uploadUrl` to get the
 * exact `{ url, name, mime, sizeBytes }` the message POST expects.
 */
export type PresignedUpload = Attachment & {
  key: string
  uploadUrl: string
}

/** POST body for a batch presign request. */
export type PresignUploadsRequest = {
  files: PresignFileInput[]
}

/** Presign endpoint response — one signed slot per requested file. */
export type PresignUploadsResponse = {
  uploads: PresignedUpload[]
}
