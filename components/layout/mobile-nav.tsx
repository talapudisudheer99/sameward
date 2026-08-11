"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import Sidebar from "@/components/layout/sidebar"
import { TeamHubLogo } from "@/components/layout/teamhub-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Phone/tablet app chrome — hamburger opens the same sidebar as desktop.
 * Hidden from `md` up (desktop already has the docked aside).
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer after navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3 md:hidden">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <Link
          href="/workspace"
          className="flex min-w-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <TeamHubLogo variant="horizontal" size={24} />
        </Link>
      </header>

      {/* Backdrop + drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(100%,16rem)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  )
}
