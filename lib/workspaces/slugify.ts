import { Workspace } from "@/lib/models/workspace/workspace"

/**
 * Turn a display name into a URL-safe base slug.
 * "Acme Inc." → "acme-inc"
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // spaces & punctuation → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
}

/**
 * Find a slug that is not already taken (acme-inc, acme-inc-2, …).
 * Pass `excludeId` when renaming so this workspace’s own slug doesn’t force -2.
 */
export async function slugifyUnique(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name) || "workspace"
  let candidate = base
  let n = 2

  // Loop until Mongo has no *other* workspace with this slug
  while (
    await Workspace.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    candidate = `${base}-${n}`
    n += 1
  }

  return candidate
}
