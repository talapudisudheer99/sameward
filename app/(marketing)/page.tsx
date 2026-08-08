"use client"

import Link from "next/link"
import { Check } from "lucide-react"

import { HeroProductPreview } from "@/components/marketing/hero-product-preview"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function MarketingPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="bg-hero-aurora pointer-events-none absolute inset-0 -z-10"
      />

      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 xl:gap-20">
          <div className="animate-in duration-500 fade-in slide-in-from-left-3">
            <p className="font-heading text-sm font-semibold tracking-[0.04em] text-primary">
              AI-powered collaboration
            </p>

            <h1 className="mt-6 max-w-lg font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-[3.5rem] lg:leading-[1.08]">
              One place for your team to plan, create and ship
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">
              Channels, docs, and boards in a calm workspace — with AI that
              helps structure work, not distract from it.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "btn-brand-gradient h-11 border-transparent px-6 text-[0.95rem] text-white shadow-sm transition hover:brightness-110"
                )}
              >
                Get started free
              </Link>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11 px-6 text-[0.95rem]"
                onClick={() => console.log("demo: coming-soon")}
              >
                Book a demo
              </Button>
            </div>

            <ul className="mt-8 flex flex-col gap-3 text-[0.95rem] text-muted-foreground sm:flex-row sm:gap-8">
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
                No credit card
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
                Set up in 2 minutes
              </li>
            </ul>
          </div>

          <div className="animate-in duration-700 fill-mode-both [animation-delay:100ms] fade-in slide-in-from-right-3">
            <HeroProductPreview />
          </div>
        </div>
      </section>
    </div>
  )
}
