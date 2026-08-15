"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronsUpDown, Settings, UserRound } from "lucide-react"

import { LogoutButton } from "@/components/layout/logout-button"
import { LogoutAllDevicesButton } from "@/components/layout/logout-all-devices-button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type AccountMenuProps = {
  displayName: string
  email: string
  avatarUrl?: string | null
  /** Profile route is showing */
  active?: boolean
  /** Mobile drawer: close after a nav click */
  onNavigate?: () => void
}

/**
 * Foot of the sidebar: who you are, plus the session actions behind a click.
 * Log out is destructive and rare, so it stays out of the resting layout.
 */
export function AccountMenu({
  displayName,
  email,
  avatarUrl,
  active = false,
  onNavigate,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const initial = displayName.slice(0, 1).toUpperCase()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Account menu"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          open || active
            ? "border-sidebar-primary/40 bg-sidebar-accent shadow-sm"
            : "border-sidebar-border bg-card shadow-sm hover:border-sidebar-primary/35 hover:bg-sidebar-accent/50"
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
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

        <ChevronsUpDown
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-64 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
      >
        <Link
          href="/profile"
          onClick={() => {
            setOpen(false)
            onNavigate?.()
          }}
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-foreground transition-colors",
            "hover:bg-muted/70",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <UserRound className="size-4 text-muted-foreground" aria-hidden />
          View profile
        </Link>

        <Link
          href="/settings"
          onClick={() => {
            setOpen(false)
            onNavigate?.()
          }}
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-foreground transition-colors",
            "hover:bg-muted/70",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <Settings className="size-4 text-muted-foreground" aria-hidden />
          Settings
        </Link>

        <div className="my-1.5 h-px bg-border" />

        <LogoutButton compact className="h-9 px-2" />
        <LogoutAllDevicesButton compact className="h-9 px-2" />
      </PopoverContent>
    </Popover>
  )
}
