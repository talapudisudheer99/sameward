import type {
  CreateMessageRequest,
  CreateMessageResponse,
  MessagesListResponse,
  ChannelListItem,
  ChannelMemberRow,
  ChannelVisibility,
} from "@/lib/types/channel/channel-types"
import { baseApi } from "@/store/api/base-api"

/**
 * Channels RTK — channel CRUD + members (T6–T8) + messages (T12).
 * Cache: Channel · ChannelMember · Message (per channelId)
 * Uploads / sockets: later slices.
 */
export const channelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /api/workspaces/:id/channels — only channels caller may access */
    getChannels: builder.query<
      { channels: ChannelListItem[] },
      { workspaceId: string }
    >({
      query: ({ workspaceId }) => `workspaces/${workspaceId}/channels`,
      providesTags: (result) => {
        const tags: { type: "Channel"; id: string }[] = [
          { type: "Channel", id: "LIST" },
        ]
        if (result?.channels) {
          for (const channel of result.channels) {
            tags.push({ type: "Channel", id: channel.id })
          }
        }
        return tags
      },
    }),

    /** GET …/channels/:channelId — flat ChannelListItem */
    getChannelById: builder.query<
      ChannelListItem,
      { workspaceId: string; channelId: string }
    >({
      query: ({ workspaceId, channelId }) =>
        `workspaces/${workspaceId}/channels/${channelId}`,
      providesTags: (_result, _error, { channelId }) => [
        { type: "Channel", id: channelId },
      ],
    }),

    /** POST …/channels — owner | admin; returns created channel */
    createChannel: builder.mutation<
      ChannelListItem,
      {
        workspaceId: string
        name: string
        visibility: ChannelVisibility
      }
    >({
      query: ({ workspaceId, name, visibility }) => ({
        url: `workspaces/${workspaceId}/channels`,
        method: "POST",
        body: { name, visibility },
      }),
      invalidatesTags: [{ type: "Channel", id: "LIST" }],
    }),

    /** PATCH …/channels/:channelId — rename */
    updateChannel: builder.mutation<
      ChannelListItem,
      { workspaceId: string; channelId: string; name: string }
    >({
      query: ({ workspaceId, channelId, name }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "Channel", id: "LIST" },
        { type: "Channel", id: channelId },
      ],
    }),

    /** DELETE …/channels/:channelId — blocked for isDefault on server */
    deleteChannel: builder.mutation<
      { ok: boolean },
      { workspaceId: string; channelId: string }
    >({
      query: ({ workspaceId, channelId }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "Channel", id: "LIST" },
        { type: "Channel", id: channelId },
      ],
    }),

    /** GET …/members — private channels only (public → 400) */
    getChannelMembers: builder.query<
      { members: ChannelMemberRow[] },
      { workspaceId: string; channelId: string }
    >({
      query: ({ workspaceId, channelId }) =>
        `workspaces/${workspaceId}/channels/${channelId}/members`,
      providesTags: (_result, _error, { channelId }) => [
        { type: "ChannelMember", id: channelId },
      ],
    }),

    /** POST …/members — { userIds }; returns added + failed */
    addChannelMembers: builder.mutation<
      {
        added: { userId: string }[]
        failed: { userId: string; reason: string }[]
      },
      { workspaceId: string; channelId: string; userIds: string[] }
    >({
      query: ({ workspaceId, channelId, userIds }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/members`,
        method: "POST",
        body: { userIds },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "ChannelMember", id: channelId },
      ],
    }),

    /** DELETE …/members/:userId */
    removeChannelMember: builder.mutation<
      { ok: boolean },
      { workspaceId: string; channelId: string; userId: string }
    >({
      query: ({ workspaceId, channelId, userId }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "ChannelMember", id: channelId },
      ],
    }),

    /**
     * GET …/messages — newest page first; response messages are oldest→newest.
     * Omit cursor for the latest page; pass nextCursor to load older later.
     */
    getMessages: builder.query<
      MessagesListResponse,
      {
        workspaceId: string
        channelId: string
        cursor?: string
        limit?: number
      }
    >({
      query: ({ workspaceId, channelId, cursor, limit }) => {
        const params = new URLSearchParams()
        if (limit != null) params.set("limit", String(limit))
        if (cursor) params.set("cursor", cursor)
        const qs = params.toString()
        return `workspaces/${workspaceId}/channels/${channelId}/messages${qs ? `?${qs}` : ""}`
      },
      providesTags: (_result, _error, { channelId }) => [
        { type: "Message", id: channelId },
      ],
    }),

    /**
     * POST …/messages — text only for now (attachments ignored until S3).
     * clientMessageId makes retries idempotent.
     * Cache: append on success (socket message:new also upserts — dedupe by id).
     */

    createMessage: builder.mutation<
      CreateMessageResponse,
      {
        workspaceId: string
        channelId: string
        body: string
        clientMessageId?: string
      }
    >({
      query: ({ workspaceId, channelId, body, clientMessageId }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/messages`,
        method: "POST",
        body: {
          body,
          ...(clientMessageId ? { clientMessageId } : {}),
        } satisfies CreateMessageRequest,
      }),

      async onQueryStarted(
        { workspaceId, channelId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled

          dispatch(
            channelsApi.util.updateQueryData(
              "getMessages",
              { workspaceId, channelId, limit: 50 },
              (draft) => {
                if (draft.messages.some((m) => m.id === data.id)) return
                draft.messages.push(data)
              }
            )
          )
        } catch {}
      },
    }),
  }),
})

export const {
  useGetChannelsQuery,
  useGetChannelByIdQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useGetChannelMembersQuery,
  useAddChannelMembersMutation,
  useRemoveChannelMemberMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
} = channelsApi
