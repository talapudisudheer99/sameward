/**
 * Channels fill the entire app `<main>` column (ignore page padding).
 * Parent `(app)/layout` main is `relative` so inset-0 matches that pane.
 */
export default function ChannelsLayout({
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
