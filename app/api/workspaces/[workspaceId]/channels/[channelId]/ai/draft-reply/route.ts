import { NextResponse } from "next/server"

import { loadRecentChannelContext } from "@/lib/ai/message-context"
import { draftReplyUserPrompt, systemPrompt } from "@/lib/ai/prompts"
import {
  completeWithContext,
  prepareAiRoute,
  zodErrorResponse,
} from "@/lib/ai/run-ai"
import { draftReplyRequestSchema } from "@/lib/schemas/ai/ai-request-schema"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; channelId: string }> }
) {
  const { workspaceId, channelId } = await params
  const prepared = await prepareAiRoute(workspaceId, channelId)
  if (!prepared.ok) return prepared.response

  let json: unknown
  try {
    json = await request.json()
  } catch {
    json = {}
  }

  const parsed = draftReplyRequestSchema.safeParse(json ?? {})
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const context = await loadRecentChannelContext(
    channelId,
    parsed.data.limit ?? 40
  )

  // Draft is for *you* to answer someone else — not to reply to yourself.
  const hasTeammateMessage = context.messages.some(
    (m) => m.authorId !== prepared.auth.userId
  )
  if (!hasTeammateMessage) {
    return NextResponse.json(
      {
        message:
          "Nothing from a teammate to reply to yet. Wait for someone else’s message, then draft.",
      },
      { status: 400 }
    )
  }

  return completeWithContext({
    auth: prepared.auth,
    kind: "draft-reply",
    system: systemPrompt(),
    userPrompt: draftReplyUserPrompt(
      context.formatted,
      parsed.data.tone,
      prepared.auth.fullName
    ),
    context,
    maxTokens: 600,
  })
}
