"use client"

import { useCallback, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import AcceptInviteCard, {
  type AcceptInviteViewState,
} from "@/components/invite/accept-invite-card"
import Loader from "@/components/sharable/loader"
import { useCurrentUser } from "@/hooks/use-current-user"
import {
  useAcceptInviteMutation,
  useGetInviteByTokenQuery,
} from "@/store/api/workspaces-api"

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status
  }
  return undefined
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return fallback
}

export default function AcceptInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params.token === "string" ? params.token : ""

  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
  } = useCurrentUser()

  const {
    data: invite,
    isLoading: inviteLoading,
    isFetching: inviteFetching,
    isError: inviteIsError,
    error: inviteError,
  } = useGetInviteByTokenQuery({ token }, { skip: !token })

  const [acceptInvite, { isLoading: isAccepting }] = useAcceptInviteMutation()
  const [acceptError, setAcceptError] = useState<string | undefined>()

  const loginHref = useMemo(() => {
    const next = `/invite/${token}`
    return `/login?next=${encodeURIComponent(next)}`
  }, [token])

  const handleAccept = useCallback(async () => {
    if (!token || isAccepting) return

    setAcceptError(undefined)

    try {
      const result = await acceptInvite({ token }).unwrap()
      toast.success("You’re in")
      router.replace(`/workspace/${result.workspaceId}`)
      router.refresh()
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not accept invite. Try again."
      )
      setAcceptError(message)
      toast.error(message)
    }
  }, [token, isAccepting, acceptInvite, router])

  const viewState: AcceptInviteViewState = useMemo(() => {
    if (!token) {
      return { kind: "not_found" }
    }

    if (inviteLoading || (inviteFetching && !invite && !inviteIsError) || authLoading) {
      return { kind: "loading" }
    }

    if (inviteIsError || !invite) {
      const status = getErrorStatus(inviteError)
      const message = getErrorMessage(inviteError, "Invite not found")

      if (status === 410) {
        return {
          kind: message.toLowerCase().includes("accepted")
            ? "accepted"
            : "expired",
        }
      }
      if (status === 404) {
        return { kind: "not_found" }
      }
      return { kind: "error", message }
    }

    if (!isAuthenticated || !user) {
      return { kind: "needs_login", invite, loginHref }
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return {
        kind: "wrong_user",
        invite,
        currentEmail: user.email,
        switchAccountHref: loginHref,
      }
    }

    return {
      kind: "ready",
      invite,
      isAccepting,
      acceptError,
      onAccept: handleAccept,
    }
  }, [
    token,
    inviteLoading,
    inviteFetching,
    invite,
    inviteIsError,
    inviteError,
    authLoading,
    isAuthenticated,
    user,
    loginHref,
    isAccepting,
    acceptError,
    handleAccept,
  ])

  if (viewState.kind === "loading") {
    return <Loader fullPage />
  }

  return <AcceptInviteCard state={viewState} />
}
