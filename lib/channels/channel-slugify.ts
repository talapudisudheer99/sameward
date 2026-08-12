import { Channel } from "@/lib/models/channel/channel"
import { slugify } from "@/lib/workspaces/slugify"

/**
 * Unique channel slug *inside one workspace* (hiring, hiring-2, …).
 * Reuses shared string `slugify` — uniqueness checks Channel, not Workspace.
 *
 * Pass `excludeId` later on rename so this channel’s own slug doesn’t force -2.
 */
export async function slugifyUniqueInWorkspace(
  workspaceId: string,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name) || "channel"
  let candidate = base
  let n = 2

  while (
    await Channel.exists({
      workspaceId,
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${base}-${n}`
    n += 1
  }

  return candidate
}
