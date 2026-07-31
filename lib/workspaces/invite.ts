import { randomBytes } from "node:crypto"

import { hashToken } from "@/lib/auth/session"
import { connectDB } from "@/lib/db/mongoose"
import {
  WorkspaceInvite,
  type WorkspaceInviteDocument,
} from "@/lib/models/workspace/workspace-invite"

/** Invite links live longer than verify-email (7 days) */
export const INVITE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7

/**
 * Create a raw token (email only) + hash (database only).
 * Same pattern as email verification / password reset.
 */
export function createInviteToken() {
  const rawToken = randomBytes(32).toString("hex")
  return {
    rawToken,
    tokenHash: hashToken(rawToken),
  }
}

/** Public accept URL — uses APP_URL like verify/reset emails (not NEXT_PUBLIC_*) */
export function buildInviteUrl(rawToken: string) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000"
  return `${appUrl}/invite/${rawToken}`
}

export function inviteExpiresAt(from = new Date()) {
  return new Date(from.getTime() + INVITE_MAX_AGE_MS)
}

export type InviteLookupError = "not_found" | "expired" | "accepted"

/**
 * Look up a pending invite by the raw token from the URL.
 * Returns the doc or a reason the link is not usable.
 * (TTL may already have deleted expired docs → those look like not_found.)
 */
export async function findPendingInviteByRawToken(
  rawToken: string
): Promise<
  | { invite: WorkspaceInviteDocument; error?: undefined }
  | { invite?: undefined; error: InviteLookupError }
> {
  if (!rawToken) {
    return { error: "not_found" }
  }

  await connectDB()

  const invite = await WorkspaceInvite.findOne({
    tokenHash: hashToken(rawToken),
  })

  if (!invite) {
    return { error: "not_found" }
  }

  if (invite.acceptedAt) {
    return { error: "accepted" }
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return { error: "expired" }
  }

  return { invite }
}
