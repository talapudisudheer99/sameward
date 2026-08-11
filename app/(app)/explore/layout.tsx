/**
 * Explore fills the app main column (same full-bleed pattern as channels).
 */
export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden bg-background">
      {children}
    </div>
  )
}
