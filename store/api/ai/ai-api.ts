import type { AiResponse, AiTone } from "@/lib/types/ai/ai-types"
import { baseApi } from "@/store/api/base-api"

type ChannelAiArgs = {
  workspaceId: string
  channelId: string
}

/**
 * Path A AI mutations — no cache tags (ephemeral text responses).
 */
export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiSummarize: builder.mutation<
      AiResponse,
      ChannelAiArgs & { limit?: number }
    >({
      query: ({ workspaceId, channelId, limit }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/summarize`,
        method: "POST",
        body: limit != null ? { limit } : {},
      }),
    }),

    aiCatchUp: builder.mutation<
      AiResponse,
      ChannelAiArgs & { since: string; limit?: number }
    >({
      query: ({ workspaceId, channelId, since, limit }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/catch-up`,
        method: "POST",
        body: { since, ...(limit != null ? { limit } : {}) },
      }),
    }),

    aiAsk: builder.mutation<
      AiResponse,
      ChannelAiArgs & { question: string; limit?: number; since?: string }
    >({
      query: ({ workspaceId, channelId, question, limit, since }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/ask`,
        method: "POST",
        body: {
          question,
          ...(limit != null ? { limit } : {}),
          ...(since ? { since } : {}),
        },
      }),
    }),

    aiExplain: builder.mutation<
      AiResponse,
      ChannelAiArgs & { messageId: string }
    >({
      query: ({ workspaceId, channelId, messageId }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/explain`,
        method: "POST",
        body: { messageId },
      }),
    }),

    aiDraftReply: builder.mutation<
      AiResponse,
      ChannelAiArgs & { tone?: AiTone; limit?: number }
    >({
      query: ({ workspaceId, channelId, tone, limit }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/draft-reply`,
        method: "POST",
        body: {
          ...(tone ? { tone } : {}),
          ...(limit != null ? { limit } : {}),
        },
      }),
    }),

    aiNotes: builder.mutation<
      AiResponse,
      ChannelAiArgs & { since?: string; limit?: number }
    >({
      query: ({ workspaceId, channelId, since, limit }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/ai/notes`,
        method: "POST",
        body: {
          ...(since ? { since } : {}),
          ...(limit != null ? { limit } : {}),
        },
      }),
    }),
  }),
})

export const {
  useAiSummarizeMutation,
  useAiCatchUpMutation,
  useAiAskMutation,
  useAiExplainMutation,
  useAiDraftReplyMutation,
  useAiNotesMutation,
} = aiApi
