import { NextResponse } from "next/server"

import type { AiKind } from "@/lib/ai/constants"
import { buildLinkContext } from "@/lib/ai/link-context"
import { getAiProvider } from "@/lib/ai/openai-provider"
import { isAiProviderError } from "@/lib/ai/provider"
import { checkAiRateLimit } from "@/lib/ai/rate-limit"
import type { MessageContextResult } from "@/lib/ai/message-context"
import { AiRun } from "@/lib/models/ai/ai-run"
import { getCurrentUser } from "@/lib/auth/session"
import { requireChannelAccess } from "@/lib/channels/access"

export type AiResponseBody = {
  text: string
  meta: {
    messageCount: number
    truncated: boolean
    since: string | null
    model: string
    linksFetched: number
    linksFailed: number
    linksAttempted: number
  }
}

export type AiRouteAuth = {
  userId: string
  fullName: string
  workspaceId: string
  channelId: string
}

/**
 * Session + channel access + rate limit. Returns auth or a Response to return.
 */
export async function prepareAiRoute(
  workspaceId: string,
  channelId: string
): Promise<
  { ok: true; auth: AiRouteAuth } | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    }
  }

  const access = await requireChannelAccess(workspaceId, channelId, user.id)
  if (!access.ok) return { ok: false, response: access.response }

  const rate = checkAiRateLimit(user.id)
  if (!rate.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "AI rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSec) },
        }
      ),
    }
  }

  return {
    ok: true,
    auth: {
      userId: user.id,
      fullName: user.fullName?.trim() || "the current user",
      workspaceId,
      channelId,
    },
  }
}

export function emptyContextResponse(): NextResponse {
  return NextResponse.json({
    text: "No messages in this window yet.",
    meta: {
      messageCount: 0,
      truncated: false,
      since: null,
      model: "",
      linksFetched: 0,
      linksFailed: 0,
      linksAttempted: 0,
    },
  } satisfies AiResponseBody)
}

export async function completeWithContext(opts: {
  auth: AiRouteAuth
  kind: AiKind
  system: string
  userPrompt: string
  context: MessageContextResult
  since?: string | null
  maxTokens?: number
  /** Prefer URLs from these messages first (e.g. Explain target) */
  preferLinkMessageIds?: string[]
}): Promise<NextResponse> {
  const {
    auth,
    kind,
    system,
    userPrompt,
    context,
    since = null,
    maxTokens,
    preferLinkMessageIds,
  } = opts

  if (context.messageCount === 0) {
    return emptyContextResponse()
  }

  try {
    const linkCtx = await buildLinkContext({
      messages: context.messages,
      preferMessageIds: preferLinkMessageIds,
    })
    const enrichedUser = linkCtx.block
      ? `${userPrompt}\n\n${linkCtx.block}`
      : userPrompt

    const provider = getAiProvider()
    const result = await provider.complete({
      system,
      user: enrichedUser,
      maxTokens,
    })

    // Best-effort audit — never fail the user response for logging
    try {
      await AiRun.create({
        workspaceId: auth.workspaceId,
        channelId: auth.channelId,
        userId: auth.userId,
        kind,
        messageCount: context.messageCount,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      })
    } catch (logErr) {
      console.error("[ai/ai_runs]", logErr)
    }

    const body: AiResponseBody = {
      text: result.text,
      meta: {
        messageCount: context.messageCount,
        truncated: context.truncated,
        since,
        model: result.model,
        linksFetched: linkCtx.meta.linksFetched,
        linksFailed: linkCtx.meta.linksFailed,
        linksAttempted: linkCtx.meta.linksAttempted,
      },
    }
    return NextResponse.json(body)
  } catch (err) {
    if (isAiProviderError(err)) {
      return NextResponse.json({ message: err.message }, { status: err.status })
    }
    console.error("[ai/complete]", err)
    return NextResponse.json(
      { message: "Something went wrong with AI. Try again." },
      { status: 500 }
    )
  }
}

export function zodErrorResponse(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}): NextResponse {
  return NextResponse.json(
    { message: "Invalid request", errors: error.flatten().fieldErrors },
    { status: 400 }
  )
}
