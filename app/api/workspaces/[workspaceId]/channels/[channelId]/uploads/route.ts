import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import uploadRequestSchema from "@/lib/schemas/channel/upload-schema"
import {
  buildAttachmentKey,
  objectUrl,
  presignAttachmentPut,
} from "@/lib/storage/s3"

/**
 * POST /api/workspaces/[workspaceId]/channels/[channelId]/uploads
 *
 * Batch presign for chat attachments (T19). Lazy upload: the client calls this
 * only when the user hits Send. We authorize + validate all files, then return
 * one presigned PUT URL per file. Bytes go browser → S3 directly (never here).
 *
 * Response items keep the same `{ url, name, mime, sizeBytes }` shape the
 * message POST + Zod already expect, plus `uploadUrl` (PUT here) and `key`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, channelId } = await params
    const access = await requireChannelAccess(workspaceId, channelId, user.id)
    if (!access.ok) return access.response

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const parsed = uploadRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const uploads = await Promise.all(
      parsed.data.files.map(async (file) => {
        const key = buildAttachmentKey({
          workspaceId,
          channelId,
          fileName: file.name,
        })

        const uploadUrl = await presignAttachmentPut({
          key,
          contentType: file.mime,
        })

        return {
          key,
          uploadUrl,
          url: objectUrl(key),
          name: file.name,
          mime: file.mime,
          sizeBytes: file.sizeBytes,
        }
      })
    )

    return NextResponse.json({ uploads }, { status: 200 })
  } catch (error) {
    console.error("Presign uploads failed:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
