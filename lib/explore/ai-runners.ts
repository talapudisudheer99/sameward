import type { AiResponse, AiTone } from "@/lib/types/ai/ai-types"

/** Injectable Channel AI runners — production uses RTK; Explore uses canned. */
export type ChannelAiRunner = {
  summarize: () => Promise<AiResponse>
  catchUp: (since: string) => Promise<AiResponse>
  ask: (question: string) => Promise<AiResponse>
  draft: (tone: AiTone) => Promise<AiResponse>
  notes: () => Promise<AiResponse>
}

export type ExplainAiRunner = (messageId: string) => Promise<AiResponse>
