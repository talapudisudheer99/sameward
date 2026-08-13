"use client"

import Link from "next/link"
import { Check } from "lucide-react"

import { Reveal } from "@/components/marketing/motion"
import { ProductUiMock } from "@/components/marketing/product-ui-mock"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MarketingHeroProps = {
  signedIn?: boolean
}

/**
 * Product-led hero — compact on phone/tablet, full mock from md+.
 * Atmosphere: solid secondary wash + faint grid (Vercel/Linear pattern), no aurora.
 */
export default function MarketingHero({ signedIn = false }: MarketingHeroProps) {
  return (
    <div className="relative isolate overflow-hidden border-b border-border/40 bg-secondary">
      <div
        aria-hidden
        className="bg-hero-grid pointer-events-none absolute inset-0 z-0 opacity-50"
      />

      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-10 text-center sm:px-8 sm:pt-14 lg:px-10 lg:pt-20">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <Reveal onMount y={10}>
            <p className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              TeamHub <span className="text-primary">AI</span>
            </p>
          </Reveal>

          <Reveal onMount y={12} delay={0.06} className="mt-3 sm:mt-5">
            <h1 className="font-heading text-[1.55rem] font-bold tracking-tight text-foreground sm:text-3xl sm:leading-[1.15] md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              One place for your team to{" "}
              <span className="text-primary">plan, create and ship</span>
            </h1>
          </Reveal>

          <Reveal onMount y={10} delay={0.12} className="mt-3 sm:mt-4">
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              Channels, link-aware Channel AI, and a calm workspace — catch up
              on the talk <span className="font-medium text-foreground/80">and</span>{" "}
              the pages your team shared.
            </p>
          </Reveal>

          <Reveal onMount y={8} delay={0.18} className="mt-6 w-full sm:mt-8 sm:w-auto">
            <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-3">
              {signedIn ? (
                <Link
                  href="/workspace"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "btn-brand-gradient h-11 w-full border-transparent px-7 text-white shadow-sm transition hover:brightness-110 sm:w-auto"
                  )}
                >
                  Open your workspaces
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "btn-brand-gradient h-11 w-full border-transparent px-7 text-white shadow-sm transition hover:brightness-110 sm:w-auto"
                    )}
                  >
                    Get started free
                  </Link>
                  <a
                    href="#channel-ai"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-11 w-full border-border/80 bg-card/70 px-6 backdrop-blur-sm transition hover:bg-card sm:w-auto"
                    )}
                  >
                    Explore Channel AI
                  </a>
                </>
              )}
            </div>
            {!signedIn ? (
              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:mt-4 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" aria-hidden />
                  No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" aria-hidden />
                  Set up in 2 minutes
                </span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4">
                You&apos;re signed in — jump back into your team.
              </p>
            )}
          </Reveal>
        </div>

        <Reveal
          onMount
          y={14}
          delay={0.26}
          className="relative mt-8 w-full sm:mt-10 lg:mt-11"
        >
          <figure
            id="product"
            className="scroll-mt-28 relative mx-auto w-full max-w-5xl pb-8 text-left sm:scroll-mt-24 sm:pb-12 lg:pb-16"
          >
            <ProductUiMock density="band" />
            <figcaption className="sr-only">
              TeamHub workspaces, channels, link previews, profiles, and
              Channel AI with link-aware context
            </figcaption>
          </figure>
        </Reveal>
      </section>
    </div>
  )
}
