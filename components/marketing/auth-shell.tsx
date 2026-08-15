import Link from "next/link"
import { ShieldCheck } from "lucide-react"

import { SamewardLogo } from "@/components/layout/sameward-logo"

type AuthShellProps = {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
  panelTitle: React.ReactNode
  panelDescription: string
}

/** Shared auth chrome — same layout for login & signup (login look). */
export function AuthShell({
  title,
  description,
  children,
  footer,
  panelTitle,
  panelDescription,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="bg-brand-panel relative hidden flex-col justify-between overflow-hidden p-10 text-slate-50 lg:flex xl:p-14">
        <Link href="/" className="relative z-10 flex w-fit items-center">
          <SamewardLogo variant="horizontal" size={32} tone="onDark" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-4xl leading-[1.15] font-bold tracking-tight">
            {panelTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            {panelDescription}
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 shadow-lg">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2 rounded-full bg-red-400/80" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs text-slate-400">
                workspace.sameward.com
              </span>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <div className="space-y-2 border-r border-white/10 bg-slate-950/60 p-3">
                <div className="h-2.5 w-16 rounded bg-primary/70" />
                <div className="h-7 rounded-md bg-primary/25" />
                <div className="h-7 rounded-md bg-white/5" />
                <div className="h-7 rounded-md bg-white/5" />
              </div>
              <div className="space-y-3 p-4">
                <div className="h-3 w-28 rounded bg-white/20" />
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 h-2 w-20 rounded bg-primary/60" />
                  <div className="h-2 w-full rounded bg-white/10" />
                  <div className="mt-1.5 h-2 w-4/5 rounded bg-white/10" />
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                  <div className="h-2 w-24 rounded bg-primary" />
                  <div className="mt-2 h-2 w-full rounded bg-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="size-4 text-primary" aria-hidden />
          Enterprise-grade security
        </p>
      </aside>

      <div className="flex flex-col bg-background">
        <div className="flex items-center px-5 py-4 lg:hidden">
          <Link href="/" className="flex items-center">
            <SamewardLogo variant="horizontal" size={28} />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[400px] animate-in duration-500 fade-in slide-in-from-bottom-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
