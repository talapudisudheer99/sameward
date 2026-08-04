import Sidebar from "@/components/layout/sidebar"
import VerifyEmailBanner from "@/components/layout/verify-email-banner"
import { requireUser } from "@/lib/auth/require-user"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  // Soft gate: still show the full app; banner only if unverified
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!user.emailVerified ? <VerifyEmailBanner /> : null}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <Sidebar />
        </aside>
        {/* relative: channels layout uses absolute inset-0 to full-bleed the chat */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
