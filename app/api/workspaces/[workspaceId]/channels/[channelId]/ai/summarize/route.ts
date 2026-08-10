import { loadRecentChannelContext } from "@/lib/ai/message-context"
import { summarizeUserPrompt, systemPrompt } from "@/lib/ai/prompts"
import {
  completeWithContext,
  prepareAiRoute,
  zodErrorResponse,
} from "@/lib/ai/run-ai"
import { summarizeRequestSchema } from "@/lib/schemas/ai/ai-request-schema"

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

  const parsed = summarizeRequestSchema.safeParse(json ?? {})
  if (!parsed.success) return zodErrorResponse(parsed.error)

  const context = await loadRecentChannelContext(channelId, parsed.data.limit)

  return completeWithContext({
    auth: prepared.auth,
    kind: "summarize",
    system: systemPrompt(),
    userPrompt: summarizeUserPrompt(context.formatted),
    context,
  })
}
