"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  LayoutGrid,
  Settings,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { TeamHubLogo } from "@/components/layout/teamhub-logo"
import { LogoutButton } from "@/components/layout/logout-button"
import { LogoutAllDevicesButton } from "@/components/layout/logout-all-devices-button"
import { buttonVariants } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/auth/use-current-user"
import { useGetWorkspacesQuery } from "@/store/api/workspace/workspaces-api"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

/** App shell only — marketing `/` is not a destination for signed-in users */
const navItems: NavItem[] = [
  {
    label: "Workspaces",
    href: "/workspace",
    icon: LayoutGrid,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

type SidebarProps = {
  /** Mobile drawer: close after a nav click */
  onNavigate?: () => void
}

/** Shared sidebar surface — the workspace card */
const sidebarCardClass =
  "rounded-xl border border-sidebar-border bg-card p-3 shadow-sm"

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useCurrentUser()
  const { data: workspacesData } = useGetWorkspacesQuery()
  const workspaces = workspacesData?.workspaces ?? []
  const workspaceCount = workspaces.length
  const quickWorkspaces = workspaces.slice(0, 5)

  const displayName = user?.fullName?.trim() || "You"
  const initial = displayName.slice(0, 1).toUpperCase()
  const email = user?.email ?? ""

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

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {/* Primary nav */}
        <nav className="flex flex-col gap-1" aria-label="App">
          <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Navigate
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                  "relative h-9 w-full justify-start gap-2 rounded-lg",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-sidebar-primary"
                  />
                ) : null}
                <Icon className="size-4" data-icon="inline-start" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.href === "/workspace" && workspaceCount > 0 ? (
                  <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {workspaceCount}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/*
          Middle card — useful for signed-in users:
          jump into real workspaces. Demo only when they have none yet.
        */}
        <div className={cn(sidebarCardClass, "mt-auto")}>
          {workspaceCount > 0 ? (
            <>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="brand-tile flex size-9 shrink-0 items-center justify-center rounded-full">
                  <LayoutGrid className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-medium tracking-tight text-foreground">
                    Jump in
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Open a workspace
                  </p>
                </div>
              </div>
              <ul className="space-y-1 border-t border-sidebar-border pt-2.5">
                {quickWorkspaces.map((ws) => {
                  const href = `/workspace/${ws.id}/channels`
                  const active = pathname.startsWith(`/workspace/${ws.id}`)
                  return (
                    <li key={ws.id}>
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                          "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-foreground hover:bg-muted/60"
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
              {workspaceCount > quickWorkspaces.length ? (
                <Link
                  href="/workspace"
                  onClick={onNavigate}
                  className="mt-2 block px-2 text-[11px] font-medium text-primary hover:underline"
                >
                  View all workspaces
                </Link>
              ) : null}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Account / session — identity sits at the foot, where users look for it */}
      <div className="border-t border-sidebar-border px-2 py-2.5">
        <Link
          href="/profile"
          onClick={onNavigate}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-[var(--radius)] px-2 py-2 transition-colors",
            "hover:bg-sidebar-accent",
            "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          )}
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="size-8 shrink-0 rounded-full object-cover ring-1 ring-sidebar-border"
            />
          ) : (
            <span
              className="brand-tile flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              aria-hidden
            >
              {initial}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">
              {displayName}
            </span>
            {email ? (
              <span className="block truncate text-[11px] text-muted-foreground">
                {email}
              </span>
            ) : null}
          </span>
        </Link>
        <LogoutButton />
        <LogoutAllDevicesButton />
      </div>
    </div>
  )
}
