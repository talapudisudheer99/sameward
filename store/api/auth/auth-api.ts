import { baseApi } from "@/store/api/base-api"

/** Safe user shape from GET /api/auth/me (matches getCurrentUser + Profile v1) */
export type CurrentUser = {
  id: string
  fullName: string
  email: string
  emailVerified: boolean
  /** False for Google-only accounts until they set a password via reset */
  hasPassword?: boolean
  title?: string
  bio?: string
  timezone?: string
  links?: { label: string; url: string }[]
  avatarUrl?: string | null
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
