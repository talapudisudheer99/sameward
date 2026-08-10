export type AiResponseMeta = {
  messageCount: number
  truncated: boolean
  since: string | null
  model: string
}

export type AiResponse = {
  text: string
  meta: AiResponseMeta
}

export type AiTone = "concise" | "friendly" | "formal"
