"use client"

import { LifeBuoy, Mail } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { getSupportEmail, getSupportMailtoHref } from "@/lib/support"
import { cn } from "@/lib/utils"

/**
 * Thin help path — opens the user’s mail app. No ticket system.
 */
export default function HelpContactSettings() {
  const email = getSupportEmail()
  const href = getSupportMailtoHref()

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Questions, bugs, or feedback? Email us and we’ll get back to you.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "btn-brand-gradient gap-2 border-transparent text-white"
          )}
        >
          <LifeBuoy className="size-4" aria-hidden />
          Email support
        </a>
        <a
          href={href}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Mail className="size-3.5 shrink-0" aria-hidden />
          <span className="break-all">{email}</span>
        </a>
      </div>
    </div>
  )
}
