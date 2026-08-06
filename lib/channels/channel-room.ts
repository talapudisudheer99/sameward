/** Shared room id for Socket.IO — keep Next and realtime in sync. */
export function channelRoomName(channelId: string): string {
  return `channel:${channelId}`
}
