"use client"

import Link from "next/link"
import {
  Building2,
  Code2,
  FileText,
  Link2,
  MessageCircleQuestion,
  PenLine,
  Rocket,
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { Beat, useBeatClock } from "@/components/marketing/motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LandingSectionsProps = {
  signedIn?: boolean
}

const primaryHref = (signedIn: boolean) => (signedIn ? "/workspace" : "/signup")
const primaryLabel = (signedIn: boolean) =>
  signedIn ? "Open workspaces" : "Get started free"

const channelAiCapabilities = [
  {
    Icon: Sparkles,
    title: "Summarize",
    body: "A short read of what’s been decided — without rereading the whole thread.",
  },
  {
    Icon: FileText,
    title: "Catch up",
    body: "Bullet highlights from the last day or week when you’ve been offline.",
  },
  {
    Icon: MessageCircleQuestion,
    title: "Ask",
    body: "Questions grounded in this channel’s recent messages — not the open web.",
  },
  {
    Icon: Link2,
    title: "Link context",
    body: "When teammates paste docs or GitHub links, AI can read public page text — not just the URL string.",
  },
  {
    Icon: PenLine,
    title: "Draft",
    body: "A reply you can edit in the composer. Nothing posts until you send.",
  },
] as const

const solutions = [
  {
    Icon: Rocket,
    title: "Startup crews",
    body: "Stand up #general in minutes, invite by email, and keep product talk next to the people doing the work.",
    cue: "Invite → #general",
  },
  {
    Icon: Code2,
    title: "Engineering pods",
    body: "Private channels for hiring or incidents, AI that understands shared links, drafts you still own.",
    cue: "Private · Links · Draft",
  },
  {
    Icon: Building2,
    title: "Growing companies",
    body: "Owners and admins manage members; everyone gets a calm home for chat, files, and decisions.",
    cue: "Roles · Members · Invites",
  },
] as const

const resourceSteps = [
  {
    step: "01",
    title: "Create your workspace",
    body: "Name your team home and optionally describe what it’s for — so invitees land with context.",
    indent: "",
  },
  {
    step: "02",
    title: "Invite teammates",
    body: "Send email invites. They accept once, join #general, and show up in members with roles you control.",
    indent: "sm:pl-10 lg:pl-16",
  },
  {
    step: "03",
    title: "Talk, share, catch up",
    body: "Chat live, unfurl shared links, attach files, open Channel AI when you need a summary — then keep building.",
    indent: "sm:pl-20 lg:pl-32",
  },
] as const

function ChannelAiSection() {
  const { duration, at } = useBeatClock()
  const intro = 0.03
  const capsStart = 0.18
  const capGap = 0.11
  const demoParent = capsStart + channelAiCapabilities.length * capGap + 0.05

  return (
    <section
      id="channel-ai"
      className="scroll-mt-20 border-b border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <Beat
            delay={at(intro)}
            duration={duration}
            as="p"
            className="text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Channel AI
          </Beat>
          <Beat
            delay={at(intro, 1)}
            duration={duration}
            as="h2"
            y={8}
            className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            Catch up on the chat — and the links inside it
          </Beat>
          <Beat
            delay={at(intro, 2)}
            duration={duration}
            as="p"
            className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Open Channel AI inside any channel you can already access. It reads
            recent talk and public pages your team shared so answers stay
            grounded —{" "}
            <span className="font-medium text-foreground/85">
              read-only, and you always hit Send
            </span>
            .
          </Beat>
        </div>

          <div className="mt-10 grid items-start gap-8 sm:mt-12 lg:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <ul className="divide-y divide-border/60 border-y border-border/60">
              {channelAiCapabilities.map(({ Icon, title, body }, i) => {
                const parent = capsStart + i * capGap
                return (
                  <li key={title} className="py-4 first:pt-4 last:pb-4 sm:py-5 sm:first:pt-5 sm:last:pb-5">
                    <div className="flex gap-3 sm:gap-4">
                      <Beat
                        delay={at(parent)}
                        duration={duration}
                        className="brand-tile mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9"
                      >
                      <Icon
                        className="size-4"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </Beat>
                    <div className="min-w-0">
                      <Beat
                        delay={at(parent, 1)}
                        duration={duration}
                        as="h3"
                        className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg"
                      >
                        {title}
                      </Beat>
                      <Beat
                        delay={at(parent, 2)}
                        duration={duration}
                        as="p"
                        className="mt-1 text-sm leading-relaxed text-muted-foreground"
                      >
                        {body}
                      </Beat>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div>
            <Beat
              delay={at(demoParent)}
              duration={duration}
              y={8}
              className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/90 p-5 shadow-[0_24px_50px_-32px_rgba(3,105,161,0.55)] ring-1 ring-primary/10 backdrop-blur-sm sm:p-6"
            >
              <Beat
                delay={at(demoParent, 1)}
                duration={duration}
                className="flex items-center gap-2 border-b border-border/60 pb-3"
              >
                <MessageCircleQuestion className="size-4 text-primary" />
                <p className="font-heading text-sm font-semibold tracking-tight">
                  Ask in #general
                </p>
              </Beat>

              <div className="mt-4 space-y-4" aria-hidden>
                <Beat delay={at(demoParent, 2)} duration={duration}>
                  <div className="rounded-xl bg-secondary/60 px-3.5 py-3">
                    <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      You asked
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                      What does the deploy checklist say about rollback?
                    </p>
                  </div>
                </Beat>

                <Beat delay={at(demoParent, 3)} duration={duration}>
                  <div className="border-l-2 border-primary/40 pl-3.5">
                    <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                      From recent talk + linked page
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Aisha shared the runbook link. It says freeze traffic,
                      revert the last release tag, then verify health checks
                      before reopen.
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-primary/80">
                      1 linked page read for context
                    </p>
                  </div>
                </Beat>

                <Beat delay={at(demoParent, 4)} duration={duration}>
                  <div className="rounded-xl border border-dashed border-primary/25 bg-background px-3.5 py-3">
                    <div className="flex items-center gap-1.5">
                      <PenLine className="size-3.5 text-primary" />
                      <p className="text-[11px] font-semibold tracking-wide text-foreground/80 uppercase">
                        Draft in composer
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Thanks — I’ll follow the runbook rollback steps if Friday
                      deploy needs a revert.
                    </p>
                    <p className="mt-3 text-[11px] font-medium text-primary">
                      Insert → edit → you hit Send
                    </p>
                  </div>
                </Beat>
              </div>
            </Beat>
          </div>
        </div>
      </div>
    </section>
  )
}

function SolutionsSection() {
  const { duration, at } = useBeatClock()
  const intro = 0.03
  const bandStart = 0.2
  const bandGap = 0.18

  return (
    <section
      id="solutions"
      className="scroll-mt-20 border-b border-border/40 bg-muted/60"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <Beat
            delay={at(intro)}
            duration={duration}
            as="p"
            className="text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Solutions
          </Beat>
          <Beat
            delay={at(intro, 1)}
            duration={duration}
            as="h2"
            y={8}
            className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            Built for teams that ship together
          </Beat>
          <Beat
            delay={at(intro, 2)}
            duration={duration}
            as="p"
            className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            One workspace per team. Clear roles. Less tool-switching.
          </Beat>
        </div>

        <ul className="mt-8 space-y-3 sm:mt-10 md:mt-12">
          {solutions.map(({ Icon, title, body, cue }, i) => {
            const reverse = i % 2 === 1
            const parent = bandStart + i * bandGap
            return (
              <li key={title}>
                <Beat
                  delay={at(parent)}
                  duration={duration}
                  y={8}
                  className={cn(
                    "grid items-stretch overflow-hidden rounded-xl ring-1 ring-primary/10 sm:grid-cols-[1.4fr_0.75fr]",
                    "bg-linear-to-br from-secondary/80 via-card to-accent/40",
                    reverse &&
                      "sm:grid-cols-[0.75fr_1.4fr] sm:[&>*:first-child]:order-2"
                  )}
                >
                  <div className="flex flex-col justify-center px-5 py-5 sm:px-7 sm:py-5 lg:px-8">
                    <Beat
                      delay={at(parent, 1)}
                      duration={duration}
                      as="h3"
                      className="font-heading text-lg font-semibold tracking-tight sm:text-xl"
                    >
                      {title}
                    </Beat>
                    <Beat
                      delay={at(parent, 2)}
                      duration={duration}
                      as="p"
                      className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground"
                    >
                      {body}
                    </Beat>
                  </div>
                  <Beat
                    delay={at(parent, 3)}
                    duration={duration}
                    className={cn(
                      "relative flex items-center gap-2.5 border-t border-primary/10 px-5 py-4 sm:border-t-0 sm:px-6",
                      "bg-linear-to-br from-primary/12 via-secondary/80 to-accent/50",
                      reverse
                        ? "sm:border-r sm:border-primary/10"
                        : "sm:border-l sm:border-primary/10"
                    )}
                  >
                    <span className="brand-tile flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <Icon
                        className="size-4"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    <p className="text-sm font-medium text-foreground/85">
                      {cue}
                    </p>
                  </Beat>
                </Beat>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function ResourcesSection({
  cta,
  ctaLabel,
}: {
  cta: string
  ctaLabel: string
}) {
  const { duration, at } = useBeatClock()
  const intro = 0.03
  const stepStart = 0.16
  const stepGap = 0.17
  const ctaStart = stepStart + resourceSteps.length * stepGap + 0.06

  return (
    <section
      id="resources"
      className="scroll-mt-20 border-t border-border/40 bg-secondary"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Beat
            delay={at(intro)}
            duration={duration}
            as="p"
            className="text-xs font-semibold tracking-[0.14em] text-primary uppercase"
          >
            Resources
          </Beat>
          <Beat
            delay={at(intro, 1)}
            duration={duration}
            as="h2"
            y={8}
            className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            From signup to first channel in minutes
          </Beat>
        </div>

        <ol className="mx-auto mt-10 max-w-3xl space-y-7 sm:mt-12 sm:space-y-8 md:mt-14 md:space-y-10">
          {resourceSteps.map(({ step, title, body, indent }, i) => {
            const parent = stepStart + i * stepGap
            return (
              <li key={step} className={cn("relative", indent)}>
                {i < 2 ? (
                  <span
                    aria-hidden
                    className="absolute top-[2.75rem] left-[1.15rem] hidden h-[calc(100%+0.5rem)] w-px bg-linear-to-b from-primary/35 to-primary/5 md:block"
                  />
                ) : null}
                <div className="flex gap-3 sm:gap-4 md:gap-5">
                  <Beat
                    delay={at(parent)}
                    duration={duration}
                    as="span"
                    y={6}
                    className="font-heading text-3xl font-bold leading-none tracking-tight text-primary/25 sm:text-4xl md:text-5xl"
                  >
                    {step}
                  </Beat>
                  <div className="min-w-0 pt-0.5 sm:pt-1">
                    <Beat
                      delay={at(parent, 1)}
                      duration={duration}
                      as="h3"
                      className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                    >
                      {title}
                    </Beat>
                    <Beat
                      delay={at(parent, 2)}
                      duration={duration}
                      as="p"
                      className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-[0.95rem]"
                    >
                      {body}
                    </Beat>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="mx-auto mt-12 max-w-md border-t border-primary/15 pt-10 text-center sm:mt-16 sm:pt-12 md:mt-20 md:pt-14">
          <Beat delay={at(ctaStart)} duration={duration} className="flex justify-center">
            <Link
              href={cta}
              className={cn(
                buttonVariants({ size: "lg" }),
                "btn-brand-gradient h-11 w-full max-w-xs gap-2 border-transparent px-8 text-white transition hover:brightness-110 sm:h-12 sm:w-auto"
              )}
            >
              {ctaLabel}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Beat>
          <Beat
            delay={at(ctaStart, 1)}
            duration={duration}
            as="p"
            className="mt-4 text-sm text-muted-foreground"
          >
            No credit card · Set up in about two minutes
          </Beat>
        </div>
      </div>
    </section>
  )
}

/**
 * Landing body — sequential parent → children beats per section.
 */
export default function LandingSections({
  signedIn = false,
}: LandingSectionsProps) {
  const cta = primaryHref(signedIn)
  const ctaLabel = primaryLabel(signedIn)

  return (
    <div>
      <ChannelAiSection />
      <SolutionsSection />
      <ResourcesSection cta={cta} ctaLabel={ctaLabel} />
    </div>
  )
}
