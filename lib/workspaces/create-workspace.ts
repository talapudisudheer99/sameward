import { connectDB } from "@/lib/db/mongoose"
import {
  Membership,
  MembershipRole,
} from "@/lib/models/workspace/membership"
import { Workspace } from "@/lib/models/workspace/workspace"
import { slugifyUnique } from "@/lib/workspaces/slugify"

/**
 * Create a workspace and make this user the owner — always together.
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
  } catch (error) {
    // Never leave a workspace without an owner membership
    await Workspace.deleteOne({ _id: workspace._id })
    throw error
  }

  return { workspace, role: MembershipRole.Owner }
}
