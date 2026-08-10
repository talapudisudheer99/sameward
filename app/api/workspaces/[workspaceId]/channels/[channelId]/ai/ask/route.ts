import { NextResponse } from "next/server"

import {
  loadRecentChannelContext,
  loadSinceChannelContext,
} from "@/lib/ai/message-context"
import { askUserPrompt, systemPrompt } from "@/lib/ai/prompts"
import {
  completeWithContext,
  prepareAiRoute,
  zodErrorResponse,
} from "@/lib/ai/run-ai"
import { askRequestSchema } from "@/lib/schemas/ai/ai-request-schema"

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

  const parsed = askRequestSchema.safeParse(json)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const context = parsed.data.since
    ? await loadSinceChannelContext(
        channelId,
        new Date(parsed.data.since),
        parsed.data.limit
      )
    : await loadRecentChannelContext(channelId, parsed.data.limit)

  return completeWithContext({
    auth: prepared.auth,
    kind: "ask",
    system: systemPrompt(),
    userPrompt: askUserPrompt(context.formatted, parsed.data.question),
    context,
    since: parsed.data.since ?? null,
  })
}
