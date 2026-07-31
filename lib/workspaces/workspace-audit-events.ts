/**
 * Canonical workspace audit event names.
 * Use these in routes so strings stay consistent in Mongo.
 */
export const WorkspaceAuditEvent = {
  Created: "workspace.created",
  Renamed: "workspace.renamed",
  Deleted: "workspace.deleted",
  InviteSent: "invite.sent",
  InviteAccepted: "invite.accepted",
  MemberLeft: "member.left",
  MemberRemoved: "member.removed",
  RoleChanged: "member.role_changed",
} as const

export type WorkspaceAuditEventName =
  (typeof WorkspaceAuditEvent)[keyof typeof WorkspaceAuditEvent]
