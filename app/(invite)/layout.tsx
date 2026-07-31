import Link from "next/link"

import { TeamHubLogo } from "@/components/layout/teamhub-logo"

/**
 * Invite accept lives outside (app) so guests can open the link
 * without requireUser() / sidebar. Proxy does not match /invite/*.
 */
export default function InviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center border-b border-border px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <TeamHubLogo className="size-7" />
          <span className="font-heading text-sm font-semibold tracking-tight">
            TeamHub AI
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}
