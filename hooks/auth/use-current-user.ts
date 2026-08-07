"use client"

import { useGetCurrentUserQuery } from "@/store/api/auth/auth-api"

/**
 * App-wide “who am I?” for client UI gates.
 *
 * Prefer this over calling /api/auth/me ad hoc.
 * Server routes still use getCurrentUser() — never trust the client alone.
 *
 * @example
 * const { user, emailVerified, isLoading } = useCurrentUser()
 * if (!emailVerified) hide Send invite
 */
export function useCurrentUser() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetCurrentUserQuery()

  const user = data?.user

  return {
    user,
    /** Convenience — false while loading / logged out */
    emailVerified: user?.emailVerified === true,
    isAuthenticated: Boolean(user),
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  }
}
