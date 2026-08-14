/**
 * Human-readable link-context meta for Channel AI panel / Explain dialog.
 */
export function formatAiLinkMeta(meta: {
  linksFetched?: number
  linksFailed?: number
  linksAttempted?: number
}): string | null {
  const fetched = meta.linksFetched ?? 0
  const failed = meta.linksFailed ?? 0
  if (fetched <= 0 && failed <= 0) return null

  if (fetched > 0 && failed > 0) {
    return `${fetched} linked page${fetched === 1 ? "" : "s"} · ${failed} failed`
  }
  if (fetched > 0) {
    return `${fetched} linked page${fetched === 1 ? "" : "s"}`
  }
  return `couldn't read ${failed} linked page${failed === 1 ? "" : "s"}`
}
