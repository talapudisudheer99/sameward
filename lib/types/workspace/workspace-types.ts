/**
 * Shared workspace / invite types — match API JSON so RTK can plug in without remapping.
 * Do not import Mongoose models into Client Components.
 *
 * Module layout: `lib/types/<module>/…`
 */

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

/**
 * Lightweight member row for pickers (e.g. invite to private channel).
 * No role — filter/source from workspace members in the parent.
 */
export type WorkspaceMemberOption = {
  userId: string
  fullName: string
  email: string
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

/** Same string values as `lib/models/workspace/membership` MembershipRole */
export enum MembershipRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}
