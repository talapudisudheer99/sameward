import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import avatarPresignSchema from "@/lib/schemas/profile/avatar-presign-schema"
import {
  buildAvatarKey,
  objectUrl,
  presignAttachmentPut,
} from "@/lib/storage/s3"

/**
 * POST /api/auth/me/avatar — presign one avatar PUT (images ≤2MB).
 */
export async function POST(req: Request) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }

  const parsed = avatarPresignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: "Validation failed" }, { status: 400 })
  }

  const { name, mime, sizeBytes } = parsed.data
  const key = buildAvatarKey({ userId: sessionUser.id, fileName: name })
  const url = objectUrl(key)

  try {
    const uploadUrl = await presignAttachmentPut({
      key,
      contentType: mime,
    })

    return NextResponse.json(
      {
        upload: {
          key,
          uploadUrl,
          url,
          name,
          mime,
          sizeBytes,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Avatar presign failed:", error)
    return NextResponse.json(
      { message: "Could not prepare upload" },
      { status: 503 }
    )
  }
}
