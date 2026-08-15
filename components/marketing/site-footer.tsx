"use client"

import Link from "next/link"

import { Reveal } from "@/components/marketing/motion"
import { SamewardLogo } from "@/components/layout/sameward-logo"
import { getSupportEmail, getSupportMailtoHref } from "@/lib/support"

type SiteFooterProps = {
  signedIn?: boolean
}

const exploreLinks = [
  { label: "Product", href: "#product" },
  { label: "Channel AI", href: "#channel-ai" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
] as const

/**
 * Marketing footer — brand + nav + support mailto.
 */
export default function SiteFooter({ signedIn = false }: SiteFooterProps) {
  const year = new Date().getFullYear()
  const supportEmail = getSupportEmail()
  const supportHref = getSupportMailtoHref()

  return (
    <footer className="border-t border-border/60 bg-linear-to-b from-secondary/55 via-background to-background">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-8 sm:pt-16 lg:px-10">
        <Reveal className="grid gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-[1.4fr_0.7fr_0.7fr] md:gap-12 lg:gap-16">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SamewardLogo variant="horizontal" size={28} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One calm place for your team to plan, create, and ship.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Account
            </p>
            <ul className="mt-4 space-y-2.5">
              {signedIn ? (
                <li>
                  <Link
                    href="/workspace"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Workspaces
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Sign up
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a
                  href={supportHref}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">© {year} Sameward</p>
          <a
            href={supportHref}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  )
}
