import type {
  ChannelListItem,
  ChannelMemberRow,
  DmListItem,
} from "@/lib/types/channel/channel-types"
import type { WorkspaceMemberOption } from "@/lib/types/workspace/workspace-types"

/** Map a DM list row into the shared channel list shape for the chat shell. */
export function dmListItemToChannel(
  dm: DmListItem
): ChannelListItem {
  return {
    id: dm.id,
    name: dm.peer.fullName,
    slug: `dm-${dm.id}`,
    visibility: "dm",
    isDefault: false,
    unreadCount: dm.unreadCount,
    lastReadAt: dm.lastReadAt,
    peer: dm.peer,
  }
}

type MentionArgs = {
  isPrivate: boolean
  isDm: boolean
  peer?: { userId: string; fullName: string } | null
  channelMembers: ChannelMemberRow[]
  workspaceMembers: WorkspaceMemberOption[]
  currentUserId: string
}

/**
 * Who can appear in the @mention picker for the open room.
 * Excludes the current user.
 */
export function resolveMentionCandidates({
  isPrivate,
  isDm,
  peer,
  channelMembers,
  workspaceMembers,
  currentUserId,
}: MentionArgs): WorkspaceMemberOption[] {
  let pool: WorkspaceMemberOption[]

  if (isPrivate) {
    pool = channelMembers.map((m) => ({
      userId: m.userId,
      fullName: m.fullName,
      email: m.email,
    }))
  } else if (isDm && peer) {
    const fromRoster = workspaceMembers.find((m) => m.userId === peer.userId)
    pool = [
      fromRoster ?? {
        userId: peer.userId,
        fullName: peer.fullName,
        email: "",
      },
    ]
  } else {
    pool = workspaceMembers
  }

  return pool.filter((m) => m.userId !== currentUserId)
}
