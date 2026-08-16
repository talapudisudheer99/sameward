/**
 * Timezone helpers for the profile editor.
 *
 * Zones come from the platform's IANA database rather than a hardcoded list, so
 * the options stay correct as zones change without us shipping an update.
 */

/** Spread of common zones for engines without `Intl.supportedValuesOf`. */
const FALLBACK_ZONES = [
  "UTC",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Jakarta",
  "Asia/Kolkata",
  "Asia/Manila",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Melbourne",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Warsaw",
  "Pacific/Auckland",
]

export function listTimezones(): string[] {
  try {
    const supported = Intl.supportedValuesOf?.("timeZone")
    if (supported && supported.length > 0) return [...supported]
  } catch {
    // Older engine — fall back to the curated spread below.
  }
  return FALLBACK_ZONES
}

/** The viewer's own zone. Call from an event handler, never during render. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

/** "GMT+5:30" so people can sanity-check the zone they picked. */
export function timezoneOffsetLabel(zone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date())
    return parts.find((part) => part.type === "timeZoneName")?.value ?? null
  } catch {
    return null
  }
}

/** Current local time in a zone — the detail that makes a zone meaningful. */
export function timezoneLocalTime(zone: string): string | null {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date())
  } catch {
    return null
  }
}

export function isValidTimezone(zone: string): boolean {
  if (!zone.trim()) return false
  return timezoneOffsetLabel(zone) !== null
}

/** Drop the region prefix so options read as places, not paths. */
export function timezoneCityLabel(zone: string): string {
  const tail = zone.includes("/") ? zone.slice(zone.indexOf("/") + 1) : zone
  return tail.replace(/_/g, " ").replace(/\//g, " · ")
}

export type TimezoneGroup = {
  region: string
  zones: string[]
}

/** Region → zones, so a few hundred entries stay scannable. */
export function groupTimezones(zones: string[]): TimezoneGroup[] {
  const groups = new Map<string, string[]>()

  for (const zone of zones) {
    const region = zone.includes("/") ? zone.slice(0, zone.indexOf("/")) : "Other"
    const existing = groups.get(region)
    if (existing) existing.push(zone)
    else groups.set(region, [zone])
  }

  return [...groups.entries()]
    .map(({ 0: region, 1: list }) => ({
      region,
      zones: [...list].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.region.localeCompare(b.region))
}
