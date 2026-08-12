import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query"

import { redirectIfSessionLost } from "@/lib/auth/redirect-if-session-lost"

/**
 * Shared RTK Query API for the whole app.
 *
 * - One createApi slice; feature files inject endpoints (see workspaces-api.ts).
 * - reducerPath "api" → state lives at store.getState().api
 * - middleware handles caching, deduping, refetch, invalidation.
 *
 * credentials: "include" sends the httpOnly session cookie (same as axios withCredentials).
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
})

const baseQueryWithSession: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    redirectIfSessionLost()
  }
  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithSession,
  // Cache labels — mutations invalidate these so lists refetch automatically
  tagTypes: ["Workspace", "User", "Channel", "ChannelMember", "Message"],
  // Endpoints start empty; feature files use injectEndpoints
  endpoints: () => ({}),
})
