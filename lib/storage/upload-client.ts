import type {
  Attachment,
  PresignedUpload,
} from "@/lib/types/upload/upload-types"

/**
 * Client-side upload orchestration — reusable by any feature (chat now, avatars
 * later). This is the generic half: push bytes to a presigned URL. The
 * context-specific half (getting the presign) lives in the RTK upload slice.
 *
 * Runs in the browser only — it never touches our AWS secret.
 */

/**
 * PUT one file's bytes to its presigned URL. The `Content-Type` must match what
 * the server signed, or S3 rejects the upload.
 */

export async function putFileToS3(
  upload: PresignedUpload,
  file: File
): Promise<void> {
  const res = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": upload.mime },
    body: file,
  })

  if (!res.ok) {
    throw new Error(`Upload failed for "${upload.name}" (${res.status})`)
  }
}

/**
 * Upload every file in parallel (Promise.all). `uploads[i]` pairs with
 * `files[i]` — the presign response preserves request order. Resolves to the
 * attachment metadata (drops `key`/`uploadUrl`) ready for the message POST.
 * Rejects if any upload fails, so the caller can abort the send.
 */
export async function uploadFilesToS3(
  uploads: PresignedUpload[],
  files: File[]
): Promise<Attachment[]> {
  if (uploads.length !== files.length) {
    throw new Error("Upload/file count mismatch")
  }

  await Promise.all(uploads.map((upload, i) => putFileToS3(upload, files[i]!)))

  return uploads.map((u) => ({
    url: u.url,
    name: u.name,
    mime: u.mime,
    sizeBytes: u.sizeBytes,
  }))
}
