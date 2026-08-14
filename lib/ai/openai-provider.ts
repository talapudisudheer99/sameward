import OpenAI from "openai"

import { resolveAiModel } from "@/lib/ai/constants"
import {
  aiProviderError,
  isAiProviderError,
  type AiCompleteInput,
  type AiCompleteResult,
  type AiProvider,
} from "@/lib/ai/provider"

const TIMEOUT_MS = 60_000

let client: OpenAI | null = null

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) {
    throw aiProviderError(
      "AI is not configured. Set OPENAI_API_KEY on the server."
    )
  }
  if (!client) {
    client = new OpenAI({ apiKey: key, timeout: TIMEOUT_MS })
  }
  return client
}

/**
 * OpenAI Chat Completions — server-only.
 */
export const openaiProvider: AiProvider = {
  async complete(input: AiCompleteInput): Promise<AiCompleteResult> {
    const model = resolveAiModel()
    try {
      const response = await getClient().chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: input.maxTokens ?? 1200,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      })

      const text = response.choices[0]?.message?.content?.trim() ?? ""
      if (!text) {
        throw aiProviderError("The AI returned an empty response.", 502)
      }

      return {
        text,
        model: response.model ?? model,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
      }
    } catch (err) {
      if (isAiProviderError(err)) throw err
      console.error("[ai/openai]", err)
      throw aiProviderError(
        "AI provider is temporarily unavailable. Try again shortly.",
        502
      )
    }
  },
}

/** Default provider for Path A v1 */
export function getAiProvider(): AiProvider {
  return openaiProvider
}
