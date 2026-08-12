import { SiteHeader } from "@/components/marketing/site-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
