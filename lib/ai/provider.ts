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

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly status: 503 | 502 = 503
  ) {
    super(message)
    this.name = "AiProviderError"
  }
}
