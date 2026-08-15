"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Hash,
  Home,
  LayoutGrid,
  Plus,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"

import { TeamHubLogo } from "@/components/layout/teamhub-logo"
import { AccountMenu } from "@/components/layout/account-menu"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { useGetWorkspacesQuery } from "@/store/api/workspace/workspaces-api"
import { cn } from "@/lib/utils"

type SidebarProps = {
  /** Mobile drawer: close after a nav click */
  onNavigate?: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  )
}

/** Primary destination row — icon + label with active rail + highlight. */
function NavRow({
  href,
  label,
  icon: Icon,
  active,
  trailing,
  onNavigate,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  trailing?: React.ReactNode
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-9 w-full items-center gap-2 rounded-lg px-2 text-sm transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-foreground hover:bg-sidebar-accent/50"
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-sidebar-primary"
        />
      ) : null}
      <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  )
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const { data: workspacesData } = useGetWorkspacesQuery()
  const workspaces = workspacesData?.workspaces ?? []
  const workspaceCount = workspaces.length

  const displayName = user?.fullName?.trim() || "You"
  const email = user?.email ?? ""
  const identityActive =
    pathname === "/profile" || pathname.startsWith("/profile/")

  // Adaptive context: /workspace/{id}/... puts the rail into "workspace mode".
  const workspaceMatch = /^\/workspace\/([^/]+)/.exec(pathname)
  const activeWorkspaceId = workspaceMatch?.[1]
  const activeWorkspace = activeWorkspaceId
    ? workspaces.find((ws) => ws.id === activeWorkspaceId)
    : undefined
  const inWorkspace = Boolean(activeWorkspace)
  const wsBase = activeWorkspaceId ? `/workspace/${activeWorkspaceId}` : ""

  return (
    <div className="bg-brand-wash flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/workspace"
          onClick={onNavigate}
          className="flex items-center rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <TeamHubLogo variant="horizontal" size={30} />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {/* Global entry — always available */}
        <nav className="flex flex-col gap-1" aria-label="App">
          <NavRow
            href="/workspace"
            label="All workspaces"
            icon={LayoutGrid}
            active={pathname === "/workspace"}
            onNavigate={onNavigate}
            trailing={
              workspaceCount > 0 ? (
                <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {workspaceCount}
                </span>
              ) : undefined
            }
          />
        </nav>

        {/* Workspace mode — only when the user is inside a workspace */}
        {inWorkspace && activeWorkspace ? (
          <nav className="flex flex-col gap-1" aria-label="Current workspace">
            <SectionLabel>{activeWorkspace.name}</SectionLabel>
            <NavRow
              href={wsBase}
              label="Home"
              icon={Home}
              active={pathname === wsBase}
              onNavigate={onNavigate}
            />
            <NavRow
              href={`${wsBase}/channels`}
              label="Channels"
              icon={Hash}
              active={pathname.startsWith(`${wsBase}/channels`)}
              onNavigate={onNavigate}
            />
            <NavRow
              href={`${wsBase}/members`}
              label="Members"
              icon={Users}
              active={pathname.startsWith(`${wsBase}/members`)}
              onNavigate={onNavigate}
            />
          </nav>
        ) : null}

        {/* Workspace switcher / empty state */}
        {workspaceCount > 0 ? (
          <nav className="flex flex-col gap-1" aria-label="Your workspaces">
            <SectionLabel>
              {inWorkspace ? "Switch workspace" : "Your workspaces"}
            </SectionLabel>
            <ul className="flex flex-col gap-0.5">
              {workspaces.map((ws) => {
                const active = ws.id === activeWorkspaceId
                return (
                  <li key={ws.id} className="min-w-0">
                    <Link
                      href={`/workspace/${ws.id}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}
                    >
                      <span
                        className="brand-tile flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold"
                        aria-hidden
                      >
                        {ws.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 truncate">{ws.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link
              href="/workspace"
              onClick={onNavigate}
              className={cn(
                "mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors",
                "hover:bg-sidebar-accent/50 hover:text-foreground",
                "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
            >
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-sidebar-border"
                aria-hidden
              >
                <Plus className="size-3.5" />
              </span>
              New workspace
            </Link>
          </nav>
        ) : (
          <div className="rounded-xl border border-sidebar-border bg-card p-3 shadow-sm">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="brand-tile flex size-9 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm font-medium tracking-tight text-foreground">
                  Get started
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Create a workspace or try the demo
                </p>
              </div>
            </div>
            <div className="space-y-1.5 border-t border-sidebar-border pt-2.5">
              <Link
                href="/workspace"
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-muted/40 px-2.5 py-2 text-xs font-medium text-foreground transition-colors",
                  "hover:border-sidebar-primary/35 hover:bg-sidebar-accent",
                  "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                )}
              >
                <LayoutGrid className="size-3.5 shrink-0 text-primary" />
                Create a workspace
              </Link>
              <Link
                href="/explore"
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-primary transition-colors",
                  "hover:bg-sidebar-accent",
                  "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                )}
              >
                <Compass className="size-3.5 shrink-0" aria-hidden />
                Explore the demo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Account / session — identity sits at the foot, where users look for it */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <AccountMenu
          displayName={displayName}
          email={email}
          avatarUrl={user?.avatarUrl}
          active={identityActive}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  )
}
