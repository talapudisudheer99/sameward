import Link from "next/link"

import { TeamHubLogo } from "@/components/layout/teamhub-logo"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Channel AI", href: "#channel-ai" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
] as const

/**
 * Marketing chrome — one bar everywhere.
 * Phone/tablet: logo + auth CTAs (Linear/Notion pattern).
 * Desktop: centered section links. Anchors also live in the footer.
 */
export async function SiteHeader() {
  const user = await getCurrentUser()
  const signedIn = Boolean(user)

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-6 sm:px-8 lg:px-10">
        <Link
          href={signedIn ? "/workspace" : "/"}
          className="flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="sm:hidden">
            <TeamHubLogo variant="horizontal" size={28} />
          </span>
          <span className="hidden sm:inline-flex">
            <TeamHubLogo variant="horizontal" size={32} />
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-6 lg:flex"
          aria-label="Marketing"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {signedIn ? (
            <Link
              href="/workspace"
              className={cn(
                buttonVariants({ size: "sm" }),
                "btn-brand-gradient h-9 border-transparent px-3 text-white"
              )}
            >
              <span className="md:hidden">Workspaces</span>
              <span className="hidden md:inline">Open workspaces</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-9 px-2.5 text-muted-foreground sm:px-3"
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "btn-brand-gradient h-9 border-transparent px-3 text-white"
                )}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
