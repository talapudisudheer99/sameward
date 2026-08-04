import { baseApi } from "@/store/api/base-api"

/** Safe user shape from GET /api/auth/me (matches getCurrentUser) */
export type CurrentUser = {
  id: string
  fullName: string
  email: string
  emailVerified: boolean
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/auth/me — who is logged in (session cookie).
     * Hook: useGetCurrentUserQuery() or prefer useCurrentUser().
     */
    getCurrentUser: builder.query<{ user: CurrentUser }, void>({
      query: () => "auth/me",
      providesTags: [{ type: "User", id: "ME" }],
    }),
  }),
})

export const { useGetCurrentUserQuery } = authApi
