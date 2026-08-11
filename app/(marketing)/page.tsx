import MarketingHero from "@/components/marketing/marketing-hero"
import LandingSections from "@/components/marketing/landing-sections"
import SiteFooter from "@/components/marketing/site-footer"
import { getCurrentUser } from "@/lib/auth/session"

/**
 * Public landing — hero + Product / Solutions / Resources / Pricing anchors.
 */
export default async function MarketingPage() {
  const user = await getCurrentUser()
  const signedIn = Boolean(user)

  return (
    <>
      <MarketingHero signedIn={signedIn} />
      <LandingSections signedIn={signedIn} />
      <SiteFooter signedIn={signedIn} />
    </>
  )
}
