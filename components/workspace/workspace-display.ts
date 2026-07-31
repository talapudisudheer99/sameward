/** Shared display helpers for workspace list + detail UI */

export function workspaceInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
}

const TILE_COLORS = [
  "bg-violet-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-amber-500",
] as const

/** Deterministic tile color from name so the same workspace always matches list ↔ detail */
export function workspaceTileColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length]
}

export const WORKSPACE_ROLE_STYLES: Record<string, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  admin:
    "bg-amber-500/10 text-amber-600 border-amber-400/20 dark:text-amber-400",
  member: "bg-muted text-muted-foreground border-border",
}
