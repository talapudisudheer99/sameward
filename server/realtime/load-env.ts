import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Next loads `.env.local` automatically; plain `tsx` does not.
 * Fill process.env once at realtime boot (do not override already-set vars).
 */
export function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local")
  if (!existsSync(path)) return

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
