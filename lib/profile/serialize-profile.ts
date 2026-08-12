import type { UserDocument } from "@/lib/models/user"
import { presignAttachmentGet } from "@/lib/storage/s3"
import type {
  ProfileLink,
  PublicProfile,
} from "@/lib/types/profile/profile-types"

function normalizeLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const label = String((item as ProfileLink).label ?? "").trim()
      const url = String((item as ProfileLink).url ?? "").trim()
      if (!label || !url) return null
      return { label, url }
    })
    .filter((x): x is ProfileLink => x != null)
    .slice(0, 2)
}

/**
 * Map a User document → API profile. Optionally sign avatar for the browser.
 */
export async function serializeProfile(
  user: Pick<
    UserDocument,
    | "_id"
    | "fullName"
    | "email"
    | "title"
    | "bio"
    | "timezone"
    | "links"
    | "avatarUrl"
  >,
  options?: { signAvatar?: boolean }
): Promise<PublicProfile> {
  const canonical =
    typeof user.avatarUrl === "string" && user.avatarUrl.trim()
      ? user.avatarUrl.trim()
      : null

  let avatarUrl: string | null = canonical
  if (canonical && options?.signAvatar !== false) {
    avatarUrl = await presignAttachmentGet(canonical)
  }

  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    title: (user.title ?? "").trim(),
    bio: (user.bio ?? "").trim(),
    timezone: (user.timezone ?? "").trim(),
    links: normalizeLinks(user.links),
    avatarUrl,
  }
}
