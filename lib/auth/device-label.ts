/**
 * Best-effort device label from User-Agent — enough for Settings, not fingerprinting.
 */
export function formatDeviceLabel(userAgent: string | null | undefined): string {
  const ua = (userAgent ?? "").trim()
  if (!ua) return "Unknown device"

  let browser = "Browser"
  if (/Edg\//i.test(ua)) browser = "Edge"
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome"
  else if (/Firefox\//i.test(ua)) browser = "Firefox"
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari"

  let os = "device"
  if (/Windows/i.test(ua)) os = "Windows"
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS"
  else if (/Android/i.test(ua)) os = "Android"
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS"
  else if (/Linux/i.test(ua)) os = "Linux"

  return `${browser} on ${os}`
}
