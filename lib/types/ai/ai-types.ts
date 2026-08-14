export type AiResponseMeta = {
  messageCount: number
  truncated: boolean
  since: string | null
  model: string
  /** V1 link-context — public URLs fetched for this run */
  linksFetched?: number
  linksFailed?: number
  linksAttempted?: number
}

export type AiResponse = {
  text: string
  meta: AiResponseMeta
}

export type AiTone = "concise" | "friendly" | "formal"
