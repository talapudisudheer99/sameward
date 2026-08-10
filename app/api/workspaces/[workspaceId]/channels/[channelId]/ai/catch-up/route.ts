import { NextResponse } from "next/server"

import { loadSinceChannelContext } from "@/lib/ai/message-context"
import { catchUpUserPrompt, systemPrompt } from "@/lib/ai/prompts"
import {
  completeWithContext,
  prepareAiRoute,
  zodErrorResponse,
} from "@/lib/ai/run-ai"
import { catchUpRequestSchema } from "@/lib/schemas/ai/ai-request-schema"

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
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }

  const parsed = catchUpRequestSchema.safeParse(json)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const since = new Date(parsed.data.since)
  const context = await loadSinceChannelContext(
    channelId,
    since,
    parsed.data.limit
  )

  return completeWithContext({
    auth: prepared.auth,
    kind: "catch-up",
    system: systemPrompt(),
    userPrompt: catchUpUserPrompt(context.formatted, parsed.data.since),
    context,
    since: parsed.data.since,
  })
}
