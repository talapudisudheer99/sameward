import { NextResponse } from "next/server"

import { loadExplainContext } from "@/lib/ai/message-context"
import { explainUserPrompt, systemPrompt } from "@/lib/ai/prompts"
import {
  completeWithContext,
  prepareAiRoute,
  zodErrorResponse,
} from "@/lib/ai/run-ai"
import { explainRequestSchema } from "@/lib/schemas/ai/ai-request-schema"

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

  const parsed = explainRequestSchema.safeParse(json)
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const context = await loadExplainContext(channelId, parsed.data.messageId)
  if (!context) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return completeWithContext({
    auth: prepared.auth,
    kind: "explain",
    system: systemPrompt(),
    userPrompt: explainUserPrompt(context.formatted, parsed.data.messageId),
    context,
  })
}
