import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"

const GENERAL_NAME = "general"
const GENERAL_SLUG = "general"

/**
 * Ensure the hybrid default public #general exists for a workspace.
 * - No ChannelMembership row (public → workspace membership is enough)
 * - Idempotent: safe to call on create and on first channels list
 */
export async function ensureDefaultGeneral(
  workspaceId: string,
  createdByUserId: string
) {
  const existing = await Channel.findOne({
    workspaceId,
    $or: [{ isDefault: true }, { slug: GENERAL_SLUG }],
  })

  if (existing) {
    return existing
  }

  return Channel.create({
    workspaceId,
    name: GENERAL_NAME,
    slug: GENERAL_SLUG,
    visibility: ChannelVisibility.Public,
    isDefault: true,
    createdBy: createdByUserId,
  })
}
