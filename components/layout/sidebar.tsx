"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, UserRound, type LucideIcon } from "lucide-react"

import { TeamHubLogo } from "@/components/layout/teamhub-logo"
import { LogoutButton } from "@/components/layout/logout-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LogoutAllDevicesButton } from "@/components/layout/logout-all-devices-button"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    label: "Workspace",
    href: "/workspace",
    icon: LayoutGrid,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-brand-wash flex h-full flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground">
      <Link
        href="/workspace"
        className="flex items-center rounded-[var(--radius)] px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <TeamHubLogo variant="horizontal" size={28} />
      </Link>

      <nav className="flex flex-col gap-1" aria-label="App">
        <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "relative w-full justify-start gap-2 rounded-[var(--radius)]",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-0 w-1 rounded-full bg-sidebar-primary"
                />
              ) : null}
              <Icon className="size-5" data-icon="inline-start" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* mt-auto pins logout to the bottom of the sidebar column */}
      <div className="mt-auto border-t border-sidebar-border pt-3">
        <LogoutButton />
        <LogoutAllDevicesButton />
      </div>
    </div>
  )
}
