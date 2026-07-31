import { baseApi } from "@/store/api/base-api"

/** Matches GET /api/workspaces and POST /api/workspaces response items */
export type WorkspaceListItem = {
  id: string
  name: string
  slug: string
  role: string
}

export type WorkspaceMemberListItem = {
  userId: string
  fullName: string
  email: string
  role: string
}

/** POST .../members invite batch (membership created only after accept) */
export type WorkspaceInviteResult = {
  email: string
  inviteId: string
}

export type WorkspaceInviteFailure = {
  email: string
  reason:
    | "not_found"
    | "already_member"
    | "invite_failed"
    | "email_send_failed"
    | string
}

/** GET /api/invites/[token] — pending invite preview */
export type InvitePreview = {
  email: string
  workspaceId: string
  workspaceName: string
  expiresAt: string
  status: "pending"
}

/** POST /api/invites/[token] — accept result */
export type AcceptInviteResult = {
  workspaceId: string
  role: string
}

export const workspacesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/workspaces — list workspaces I belong to.
     * Hook: useGetWorkspacesQuery()
     */
    getWorkspaces: builder.query<{ workspaces: WorkspaceListItem[] }, void>({
      query: () => "workspaces",
      // Tag this cached data so createWorkspace can invalidate it
      providesTags: (result) => {
        // Always tag the whole list
        const tags: { type: "Workspace"; id: string }[] = [
          { type: "Workspace", id: "LIST" },
        ]

        // Also tag each workspace so we can refresh one later if needed
        if (result?.workspaces) {
          for (const ws of result.workspaces) {
            tags.push({ type: "Workspace", id: ws.id })
          }
        }

        return tags
      },
    }),

    /**
     * POST /api/workspaces — create workspace (caller becomes owner).
     * Hook: useCreateWorkspaceMutation()
     */
    createWorkspace: builder.mutation<WorkspaceListItem, { name: string }>({
      query: (body) => ({
        url: "workspaces",
        method: "POST",
        body,
      }),
      // After create, refetch the list automatically
      invalidatesTags: [{ type: "Workspace", id: "LIST" }],
    }),

    /**
     * GET /api/workspaces/[workspaceId]
     * Return one workspace + my role — only if I am a member.
     * Hook: useGetWorkspaceByIdQuery({ workspaceId })
     */
    getWorkspaceById: builder.query<WorkspaceListItem, { workspaceId: string }>(
      {
        query: ({ workspaceId }) => `workspaces/${workspaceId}`,
        // Tag this one workspace so future mutations can refetch just it
        providesTags: (_result, _error, { workspaceId }) => [
          { type: "Workspace", id: workspaceId },
        ],
      }
    ),

    /**
     * GET /api/workspaces/[workspaceId]/members
     * Any member can list people in this workspace (read-only).
     * Hook: useGetWorkspaceMembersQuery({ workspaceId })
     */
    getWorkspaceMembers: builder.query<
      { members: WorkspaceMemberListItem[] },
      { workspaceId: string }
    >({
      query: ({ workspaceId }) => `workspaces/${workspaceId}/members`,
      providesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
      ],
    }),

    /**
     * POST /api/workspaces/[workspaceId]/members
     * Send invites (existing users). Does not create membership yet.
     * Hook: useInviteWorkspaceMembersMutation({ workspaceId, emails })
     */
    inviteWorkspaceMembers: builder.mutation<
      {
        invited: WorkspaceInviteResult[]
        failed: WorkspaceInviteFailure[]
      },
      { workspaceId: string; emails: string[] }
    >({
      query: ({ workspaceId, emails }) => ({
        url: `workspaces/${workspaceId}/members`,
        method: "POST",
        body: { emails },
      }),
      // Members list unchanged until accept — no invalidate needed here
    }),

    /**
     * GET /api/invites/[token] — preview pending invite (workspace name, email).
     * Hook: useGetInviteByTokenQuery({ token })
     */
    getInviteByToken: builder.query<InvitePreview, { token: string }>({
      query: ({ token }) => `invites/${encodeURIComponent(token)}`,
    }),

    /**
     * POST /api/invites/[token] — accept → membership + consume invite.
     * May set emailVerified on the user.
     * Hook: useAcceptInviteMutation()
     */
    acceptInvite: builder.mutation<AcceptInviteResult, { token: string }>({
      query: ({ token }) => ({
        url: `invites/${encodeURIComponent(token)}`,
        method: "POST",
      }),
      // New membership + maybe verified → refresh list + me
      invalidatesTags: [
        { type: "Workspace", id: "LIST" },
        { type: "User", id: "ME" },
      ],
    }),

    /**
     * DELETE /api/workspaces/[workspaceId]/members/me
     * Leave a workspace.
     * Hook: useLeaveWorkspaceMutation({ workspaceId })
     */
    leaveWorkspace: builder.mutation<{ ok: boolean }, { workspaceId: string }>({
      query: ({ workspaceId }) => ({
        url: `workspaces/${workspaceId}/members/me`,
        method: "DELETE",
      }),

      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: "LIST" },
        { type: "Workspace", id: workspaceId },
      ],
    }),

    /**
     * DELETE /api/workspaces/[workspaceId]
     * Owner-only: delete workspace + cascade memberships & invites.
     * Hook: useDeleteWorkspaceMutation({ workspaceId })
     */
    deleteWorkspace: builder.mutation<{ ok: boolean }, { workspaceId: string }>({
      query: ({ workspaceId }) => ({
        url: `workspaces/${workspaceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: "LIST" },
        { type: "Workspace", id: workspaceId },
      ],
    }),

    /**
     * DELETE /api/workspaces/[workspaceId]/members/[userId]
     * Owner/admin removes another member (not self, not owner).
     * Hook: useRemoveWorkspaceMemberMutation({ workspaceId, userId })
     */
    removeWorkspaceMember: builder.mutation<
      { ok: boolean },
      { workspaceId: string; userId: string }
    >({
      query: ({ workspaceId, userId }) => ({
        url: `workspaces/${workspaceId}/members/${userId}`,
        method: "DELETE",
      }),
      // Refetch members list (tagged with this workspace id)
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
      ],
    }),

    /**
     * PATCH /api/workspaces/[workspaceId]
     * Owner/admin rename (name + slug).
     * Hook: useUpdateWorkspaceMutation({ workspaceId, name })
     */
    updateWorkspace: builder.mutation<
      WorkspaceListItem,
      { workspaceId: string; name: string }
    >({
      query: ({ workspaceId, name }) => ({
        url: `workspaces/${workspaceId}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: "LIST" },
        { type: "Workspace", id: workspaceId },
      ],
    }),

    /**
     * PATCH /api/workspaces/[workspaceId]/members/[userId]
     * Owner-only: change role member ↔ admin.
     * Hook: useUpdateWorkspaceMemberRoleMutation({ workspaceId, userId, role })
     */
    updateWorkspaceMemberRole: builder.mutation<
      { userId: string; role: string },
      { workspaceId: string; userId: string; role: "member" | "admin" }
    >({
      query: ({ workspaceId, userId, role }) => ({
        url: `workspaces/${workspaceId}/members/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: "Workspace", id: workspaceId },
      ],
    }),
  }),
})

// Auto-generated React hooks — use these in components
export const {
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceByIdQuery,
  useGetWorkspaceMembersQuery,
  useInviteWorkspaceMembersMutation,
  useGetInviteByTokenQuery,
  useAcceptInviteMutation,
  useLeaveWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useRemoveWorkspaceMemberMutation,
  useUpdateWorkspaceMutation,
  useUpdateWorkspaceMemberRoleMutation,
} = workspacesApi
