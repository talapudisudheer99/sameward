import { connectDB } from "@/lib/db/mongoose"
import { Channel, ChannelVisibility } from "@/lib/models/channel/channel"
import { ChannelMembership } from "@/lib/models/channel/channel-membership"
import { slugifyUniqueInWorkspace } from "@/lib/channels/channel-slugify"

/**
 * Create a named channel (public or private) in a workspace.
 * - Public: Channel only (workspace membership is enough to access)
 * - Private: Channel + ChannelMembership for the creator (first key)
 *
 * DMs use `findOrCreateDm` — do not pass visibility `"dm"` here.
 * Caller must already have checked owner|admin + workspace membership.
 */
export async function createChannel(
  workspaceId: string,
  name: string,
  visibility: ChannelVisibility.Public | ChannelVisibility.Private,
  createdBy: string
): Promise<InstanceType<typeof Channel>> {
  await connectDB()

  const slug = await slugifyUniqueInWorkspace(workspaceId, name)

  const channel = await Channel.create({
    workspaceId,
    name: name.trim(),
    slug,
    visibility,
    createdBy,
    isDefault: false,
  })

  if (visibility === ChannelVisibility.Private) {
    try {
      await ChannelMembership.create({
        channelId: channel._id,
        workspaceId,
        userId: createdBy,
      })
    } catch (error) {
      // Never leave a private channel with no one who can open it
      await Channel.deleteOne({ _id: channel._id })
      throw error
    }
  }

  return channel
}
