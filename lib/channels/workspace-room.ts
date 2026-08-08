/** Shared room id for Socket.IO — keep Next and realtime in sync. */
export function workspaceRoomName(workspaceId: string): string {
  return `workspace:${workspaceId}`
}
