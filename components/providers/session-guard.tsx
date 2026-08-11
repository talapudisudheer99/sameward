"use client"

import { useCallback, useEffect, useRef } from "react"

import { redirectIfSessionLost } from "@/lib/auth/redirect-if-session-lost"
import { useGetCurrentUserQuery } from "@/store/api/auth/auth-api"

/**
 * Re-check the live session when the user returns to this tab/window.
 * Covers: max-2 device eviction, logout elsewhere, cleared site data —
 * without waiting for a full page refresh.
 */
export function SessionGuard() {
  const { refetch } = useGetCurrentUserQuery()
  const inFlight = useRef(false)
  const armed = useRef(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const validate = useCallback(async () => {
    if (inFlight.current) return
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "hidden"
    ) {
      return
    }

    inFlight.current = true
    try {
      const result = await refetch()
      const unauthorized =
        result.error != null || result.data?.user == null

      if (unauthorized) {
        redirectIfSessionLost()
      }
    } catch {
      redirectIfSessionLost()
    } finally {
      inFlight.current = false
    }
  }, [refetch])

  const scheduleValidate = useCallback(() => {
    if (!armed.current) return
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      void validate()
    }, 150)
  }, [validate])

  useEffect(() => {
    // Skip the initial mount burst (RTK already fetched /me for the shell).
    const armTimer = setTimeout(() => {
      armed.current = true
    }, 400)

    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleValidate()
    }
    const onFocus = () => scheduleValidate()
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) scheduleValidate()
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("focus", onFocus)
    window.addEventListener("pageshow", onPageShow)

    return () => {
      clearTimeout(armTimer)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [scheduleValidate])

  return null
}
