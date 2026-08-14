/**
 * Open Graph unfurl card shape — shared by API JSON, mongoose map, and UI.
 * Keep in types/ (no server imports) so Client Components can use it safely.
 */
export type LinkPreview = {
  url: string
  finalUrl: string
  title: string
  description: string | null
  imageUrl: string | null
  siteName: string | null
  faviconUrl: string | null
}
