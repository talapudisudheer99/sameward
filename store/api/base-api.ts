import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

/**
 * Shared RTK Query API for the whole app.
 *
 * - One createApi slice; feature files inject endpoints (see workspaces-api.ts).
 * - reducerPath "api" → state lives at store.getState().api
 * - middleware handles caching, deduping, refetch, invalidation.
 *
 * credentials: "include" sends the httpOnly session cookie (same as axios withCredentials).
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  // Cache labels — mutations invalidate these so lists refetch automatically
  tagTypes: ["Workspace", "User"],
  // Endpoints start empty; feature files use injectEndpoints
  endpoints: () => ({}),
})
