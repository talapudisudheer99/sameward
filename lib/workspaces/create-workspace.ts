import { connectDB } from "@/lib/db/mongoose"
import { ensureDefaultGeneral } from "@/lib/channels/ensure-default-general"
import { Channel } from "@/lib/models/channel/channel"
import { Membership, MembershipRole } from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import { slugifyUnique } from "@/lib/workspaces/slugify"

/**
 * Create a workspace and make this user the owner — always together.
 * Also creates public #general (hybrid default channel) — no ChannelMembership.
 * Route Handlers should call getCurrentUser() first, then pass userId here.
 */
export async function createWorkspaceForUser(
  userId: string,
  name: string
): Promise<{
  workspace: InstanceType<typeof Workspace>
  role: MembershipRole.Owner
}> {
  await connectDB()

  const slug = await slugifyUnique(name)

  const workspace = await Workspace.create({
    name: name.trim(),
    slug,
    ownerId: userId,
  })

  try {
    await Membership.create({
      workspaceId: workspace._id,
      userId,
      role: MembershipRole.Owner,
    })

    // PO lock: hybrid #general so the team has a place to talk immediately
    await ensureDefaultGeneral(String(workspace._id), userId)
  } catch (error) {
    // Never leave a half-created tenant (workspace without owner / without #general)
    await Channel.deleteMany({ workspaceId: workspace._id })
    await Membership.deleteMany({ workspaceId: workspace._id })
    await Workspace.deleteOne({ _id: workspace._id })
    throw error
  }

  return { workspace, role: MembershipRole.Owner }
}
