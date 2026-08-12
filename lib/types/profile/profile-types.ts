/**
 * Profile v1 public shapes — safe for Client Components (no Mongoose).
 */

export type ProfileLink = {
  label: string
  url: string
}

/** Self + teammate card (email only when authorized). */
export type PublicProfile = {
  id: string
  fullName: string
  email: string
  title: string
  bio: string
  timezone: string
  links: ProfileLink[]
  /** Presigned GET when present; null → show initials */
  avatarUrl: string | null
}

export type UpdateProfileInput = {
  fullName?: string
  title?: string
  bio?: string
  timezone?: string
  links?: ProfileLink[]
  /** Set null to clear; omit to leave unchanged */
  avatarUrl?: string | null
}
