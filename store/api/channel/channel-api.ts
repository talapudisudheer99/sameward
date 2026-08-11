import type {
  CreateMessageRequest,
  CreateMessageResponse,
  MessagesListResponse,
  ChannelListItem,
  ChannelMemberRow,
  MarkChannelReadResponse,
  DmListItem,
} from "@/lib/types/channel/channel-types"
import type { Attachment } from "@/lib/types/upload/upload-types"
import type { AppDispatch } from "@/store"
import { baseApi } from "@/store/api/base-api"

/**
 * Channels RTK — channel CRUD + members + messages + read state + DMs.
 */
export const channelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    getDms: builder.query<{ dms: DmListItem[] }, { workspaceId: string }>({
      query: ({ workspaceId }) => `workspaces/${workspaceId}/dms`,
      providesTags: (result) => {
        const tags: { type: "Channel"; id: string }[] = [
          { type: "Channel", id: "DM_LIST" },
        ]
        if (result?.dms) {
          for (const dm of result.dms) {
            tags.push({ type: "Channel", id: dm.id })
          }
        }
        return tags
      },
    }),

    openDm: builder.mutation<
      DmListItem,
      { workspaceId: string; userId: string }
    >({
      query: ({ workspaceId, userId }) => ({
        url: `workspaces/${workspaceId}/dms`,
        method: "POST",
        body: { userId },
      }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            channelsApi.util.updateQueryData(
              "getDms",
              { workspaceId },
              (draft) => {
                if (draft.dms.some((d) => d.id === data.id)) return
                draft.dms.unshift(data)
              }
            )
          )
        } catch {
          /* leave cache alone */
        }
      },
      invalidatesTags: [{ type: "Channel", id: "DM_LIST" }],
    }),

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

    createChannel: builder.mutation<
      ChannelListItem,
      {
        workspaceId: string
        name: string
        visibility: "public" | "private"
      }
    >({
      query: ({ workspaceId, name, visibility }) => ({
        url: `workspaces/${workspaceId}/channels`,
        method: "POST",
        body: { name, visibility },
      }),
      invalidatesTags: [{ type: "Channel", id: "LIST" }],
    }),

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

    markChannelRead: builder.mutation<
      MarkChannelReadResponse,
      { workspaceId: string; channelId: string }
    >({
      query: ({ workspaceId, channelId }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/read`,
        method: "POST",
      }),
      async onQueryStarted(
        { workspaceId, channelId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            channelsApi.util.updateQueryData(
              "getChannels",
              { workspaceId },
              (draft) => {
                const ch = draft.channels.find((c) => c.id === channelId)
                if (!ch) return
                ch.unreadCount = 0
                ch.lastReadAt = data.lastReadAt
              }
            )
          )
          dispatch(
            channelsApi.util.updateQueryData(
              "getDms",
              { workspaceId },
              (draft) => {
                const dm = draft.dms.find((d) => d.id === channelId)
                if (!dm) return
                dm.unreadCount = 0
                dm.lastReadAt = data.lastReadAt
              }
            )
          )
        } catch {
          /* leave cache alone on error */
        }
      },
    }),

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

    createMessage: builder.mutation<
      CreateMessageResponse,
      {
        workspaceId: string
        channelId: string
        body: string
        attachments?: Attachment[]
        mentionedUserIds?: string[]
        clientMessageId?: string
      }
    >({
      query: ({
        workspaceId,
        channelId,
        body,
        attachments,
        mentionedUserIds,
        clientMessageId,
      }) => ({
        url: `workspaces/${workspaceId}/channels/${channelId}/messages`,
        method: "POST",
        body: {
          body,
          ...(attachments && attachments.length > 0 ? { attachments } : {}),
          ...(mentionedUserIds && mentionedUserIds.length > 0
            ? { mentionedUserIds }
            : {}),
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

/** Live unread bump when someone posts in a channel/DM you’re not viewing. */
export function bumpChannelUnread(
  dispatch: AppDispatch,
  workspaceId: string,
  channelId: string
): void {
  dispatch(
    channelsApi.util.updateQueryData(
      "getChannels",
      { workspaceId },
      (draft) => {
        const ch = draft.channels.find((c) => c.id === channelId)
        if (!ch) return
        ch.unreadCount += 1
      }
    )
  )
  dispatch(
    channelsApi.util.updateQueryData("getDms", { workspaceId }, (draft) => {
      const dm = draft.dms.find((d) => d.id === channelId)
      if (!dm) return
      dm.unreadCount += 1
    })
  )
}

export const {
  useGetChannelsQuery,
  useGetDmsQuery,
  useOpenDmMutation,
  useGetChannelByIdQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useMarkChannelReadMutation,
  useGetChannelMembersQuery,
  useAddChannelMembersMutation,
  useRemoveChannelMemberMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
} = channelsApi
