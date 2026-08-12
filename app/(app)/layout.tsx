import Sidebar from "@/components/layout/sidebar"
import MobileNav from "@/components/layout/mobile-nav"
import VerifyEmailBanner from "@/components/layout/verify-email-banner"
import { SessionGuard } from "@/components/providers/session-guard"
import { SocketProvider } from "@/components/providers/socket-provider"
import { requireUser } from "@/lib/auth/require-user"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  // Soft gate: still show the full app; banner only if unverified.
  // h-dvh + overflow-hidden: sidebar stays put; only <main> scrolls.
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <SessionGuard />
      {!user.emailVerified ? <VerifyEmailBanner /> : null}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden h-full w-60 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex">
          <Sidebar />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <MobileNav />
          {/* relative: channels layout uses absolute inset-0 to full-bleed the chat */}
          <main className="relative flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6 md:p-8">
            <SocketProvider>{children}</SocketProvider>
          </main>
        </div>
      </div>
    </div>
  )
}
