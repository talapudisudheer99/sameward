import { NextResponse } from "next/server"

import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"
import { fetchOgPreview } from "@/lib/channels/og-preview"
import { linkPreviewRequestSchema } from "@/lib/schemas/channel/link-preview-schema"

/**
 * POST …/channels/:channelId/link-preview
 * Composer live unfurl — SSRF-safe OG fetch (no message write).
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

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    }

    const parsed = linkPreviewRequestSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid URL" }, { status: 400 })
    }

    const url = parsed.data.url
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ message: "Only http(s) URLs" }, { status: 400 })
    }

    const preview = await fetchOgPreview(url)
    if (!preview) {
      return NextResponse.json({ preview: null }, { status: 200 })
    }

    return NextResponse.json({ preview }, { status: 200 })
  } catch (error) {
    console.error("[link-preview]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
