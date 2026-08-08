import { randomUUID } from "node:crypto"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

/**
 * Server-only S3 helpers for chat attachments.
 *
 * The bucket is PRIVATE. The browser never gets our AWS secret — only a
 * short-lived presigned PUT URL that authorizes one object with a pinned
 * Content-Type. Never import this from a client component.
 */

const PRESIGN_PUT_TTL_SECONDS = 60

let cachedClient: S3Client | null = null

// function requireEnv(name: string): string {
//   const value = process.env[name]
//   if (!value) {
//     throw new Error(`Missing required env var: ${name}`)
//   }
//   return value
// }

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function getBucket(): string {
  return requireEnv("AWS_S3_BUCKET")
}

function getRegion(): string {
  return requireEnv("AWS_REGION")
}

// function getClient(): S3Client {
//   if (cachedClient) return cachedClient
//   cachedClient = new S3Client({
//     region: getRegion(),
//     credentials: {
//       accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
//       secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
//     },
//   })
//   return cachedClient
// }

function getClient(): S3Client {
  if (cachedClient) return cachedClient
  cachedClient = new S3Client({
    region: getRegion(),
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  })
  return cachedClient
}

/** Keep only safe filename chars so keys can't break paths or overwrite siblings. */
function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file"
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_")
  return cleaned.slice(0, 120) || "file" //React*Notes*Final*1.pdf
}

/**
 * Server-chosen object key — the client never picks this, which prevents
 * path traversal and overwriting other people's files.
 */
export function buildAttachmentKey(params: {
  workspaceId: string
  channelId: string
  fileName: string
}): string {
  const safe = sanitizeFileName(params.fileName)
  return `workspaces/${params.workspaceId}/channels/${params.channelId}/${randomUUID()}-${safe}`
}

/** Canonical https URL for an object (viewing a PRIVATE object needs a presigned GET — added in T22). */
export function objectUrl(key: string): string {
  return `https://${getBucket()}.s3.${getRegion()}.amazonaws.com/${key}`
}

/**
 * Presign a single PUT. `contentType` is baked into the signature, so the
 * browser's upload must send the exact same Content-Type we approved.
 */

export async function presignAttachmentPut(params: {
  key: string
  contentType: string
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: params.key,
    ContentType: params.contentType,
  })

  return getSignedUrl(getClient(), command, {
    expiresIn: PRESIGN_PUT_TTL_SECONDS,
  })
}
