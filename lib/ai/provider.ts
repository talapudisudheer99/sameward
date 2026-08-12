/**
 * Provider abstraction — routes call this, not OpenAI directly.
 * Swap openai-provider for Gemini/Anthropic later without rewriting handlers.
 */

export type AiCompleteInput = {
  system: string
  user: string
  /** Soft ceiling for completion tokens */
  maxTokens?: number
}

export type AiCompleteResult = {
  text: string
  model: string
  /** Prompt + completion tokens when the provider reports them */
  promptTokens?: number
  completionTokens?: number
}

export type AiProvider = {
  complete(input: AiCompleteInput): Promise<AiCompleteResult>
}

/** Simple AI failure shape — status for the route handler to return. */
export type AiProviderError = {
  name: "AiProviderError"
  message: string
  status: 502 | 503
}

export function aiProviderError(
  message: string,
  status: 502 | 503 = 503
): AiProviderError {
  return { name: "AiProviderError", message, status }
}

export function isAiProviderError(err: unknown): err is AiProviderError {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "AiProviderError"
  )
}
