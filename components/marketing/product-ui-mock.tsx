"use client"

import { Globe, Hash, Lock, Paperclip, Send, Sparkles } from "lucide-react"

import { Beat, useMarketingMotion } from "@/components/marketing/motion"
import { cn } from "@/lib/utils"

type ProductUiMockProps = {
  className?: string
  density?: "hero" | "band"
}

/** Demo faces for the marketing mock (stable seeds). */
const AVATARS = {
  sam: "https://i.pravatar.cc/80?img=12",
  aisha: "https://i.pravatar.cc/80?img=47",
  jordan: "https://i.pravatar.cc/80?img=33",
} as const

/**
 * Absolute timeline (seconds from viewport enter).
 * Sequence: Channels → Workspaces → chat people → Profile → Channel AI.
 */
function useMockTimeline() {
  const { reduce } = useMarketingMotion()
  const step = reduce ? 0 : 0.04
  const duration = reduce ? 0 : 0.26

  const at = (groupStart: number, index = 0) =>
    reduce ? 0 : groupStart + index * step

  return {
    reduce,
    duration,
    step,
    chrome: at(0),
    channelsParent: at(0.03),
    channelItem: (i: number) => at(0.06, i),
    workspacesParent: at(0.16),
    workspaceItem: (i: number) => at(0.2, i),
    chatHeader: at(0.3),
    message: (i: number) => at(0.34, i),
    composer: at(0.46),
    profileParent: at(0.52),
    profileChild: (i: number) => at(0.56, i),
    aiParent: at(0.66),
    aiChild: (i: number) => at(0.7, i),
  }
}

/**
 * Marketing product composition — mirrors app chrome (brand tiles, quiet roles).
 */
export function ProductUiMock({
  className,
  density = "band",
}: ProductUiMockProps) {
  const band = density === "band"
  const t = useMockTimeline()

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-primary/15 bg-card text-left shadow-[0_24px_60px_-28px_rgba(3,105,161,0.35)] ring-1 ring-primary/10",
        className
      )}
      aria-hidden
    >
      <Beat
        delay={t.chrome}
        duration={t.duration}
        y={0}
        className="h-1 w-full bg-linear-to-r from-(--brand-a) via-primary to-(--brand-b)"
      />

      <Beat
        delay={t.chrome}
        duration={t.duration}
        y={4}
        className="flex items-center gap-2 border-b border-border/70 bg-secondary/40 px-4 py-2 sm:px-5"
      >
        <span className="size-2 rounded-full bg-[#F87171]/70" />
        <span className="size-2 rounded-full bg-[#FBBF24]/70" />
        <span className="size-2 rounded-full bg-[#34D399]/70" />
        <span className="ml-2 truncate text-xs text-muted-foreground">
          sameward.com
        </span>
      </Beat>

      <div
        className={cn(
          "grid gap-3 bg-linear-to-br from-secondary/50 via-background to-accent/30 p-2.5 sm:gap-3 sm:p-3 lg:gap-4 lg:p-4",
          "grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.68fr)]",
          "lg:min-h-[400px]"
        )}
      >
        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
          <Beat
            delay={t.chatHeader}
            duration={t.duration}
            className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5"
          >
            <Hash className="size-3.5 shrink-0 text-primary" />
            <span className="font-heading text-sm font-semibold tracking-tight">
              general
            </span>
            <span className="hidden truncate text-[11px] text-muted-foreground md:inline">
              Northwind · 4 members · 2 online
            </span>
            <span className="btn-brand-gradient ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white">
              <Sparkles className="size-3" />
              AI
            </span>
          </Beat>

          <div className="grid min-h-0 flex-1 md:grid-cols-[148px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)]">
            <aside className="hidden border-r border-border/60 p-3 md:block">
              <Beat
                delay={t.channelsParent}
                duration={t.duration}
                x={-4}
                as="p"
                className="mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Channels
              </Beat>
              <ul className="space-y-1 text-xs">
                <Beat
                  delay={t.channelItem(0)}
                  duration={t.duration}
                  x={-5}
                  as="li"
                  className="rounded-md bg-primary/10 px-2 py-1.5 font-medium text-primary"
                >
                  # general
                </Beat>
                <Beat
                  delay={t.channelItem(1)}
                  duration={t.duration}
                  x={-5}
                  as="li"
                  className="px-2 py-1.5 text-muted-foreground"
                >
                  # backend
                </Beat>
                <Beat
                  delay={t.channelItem(2)}
                  duration={t.duration}
                  x={-5}
                  as="li"
                  className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground"
                >
                  <Lock className="size-3 shrink-0" />
                  leadership
                </Beat>
              </ul>

              <Beat
                delay={t.workspacesParent}
                duration={t.duration}
                x={-4}
                as="p"
                className="mt-5 mb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase lg:mt-6"
              >
                Workspaces
              </Beat>
              <ul className="space-y-1.5">
                <WorkspaceItem
                  initials="NW"
                  name="Northwind"
                  role="Owner"
                  active
                  delay={t.workspaceItem(0)}
                  duration={t.duration}
                />
                <WorkspaceItem
                  initials="AL"
                  name="Atlas Labs"
                  role="Member"
                  delay={t.workspaceItem(1)}
                  duration={t.duration}
                />
                <WorkspaceItem
                  initials="CS"
                  name="Customer Success"
                  role="Member"
                  delay={t.workspaceItem(2)}
                  duration={t.duration}
                />
              </ul>
            </aside>

            <div className="flex min-w-0 flex-col">
              <div className="flex-1 space-y-3 p-3 sm:space-y-3.5 sm:p-4">
                <ChatLine
                  src={AVATARS.sam}
                  name="Sam Chen"
                  body="Product sync at 10 — agenda shared."
                  delay={t.message(0)}
                  duration={t.duration}
                />
                <ChatLine
                  src={AVATARS.aisha}
                  name="Aisha Patel"
                  body="Deploy runbook for Friday:"
                  linkPreview={{
                    host: "docs.northwind.dev",
                    title: "Backend deploy & rollback checklist",
                  }}
                  delay={t.message(1)}
                  duration={t.duration}
                />
                {band ? (
                  <ChatLine
                    src={AVATARS.jordan}
                    name="Jordan Lee"
                    body="Dashboard snapshot attached."
                    attachment
                    delay={t.message(2)}
                    duration={t.duration}
                  />
                ) : null}
              </div>
              <Beat
                delay={t.composer}
                duration={t.duration}
                className="border-t border-border/60 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-2">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    Message #general
                  </span>
                  <span className="btn-brand-gradient inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white">
                    <Send className="size-3" />
                    Send
                  </span>
                </div>
              </Beat>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-col">
          <Beat
            delay={t.profileParent}
            duration={t.duration}
            as="section"
            className="hidden rounded-xl border border-border/60 bg-card p-3.5 sm:block sm:p-4"
          >
            <Beat
              delay={t.profileChild(0)}
              duration={t.duration}
              as="p"
              className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Profile
            </Beat>
            <Beat
              delay={t.profileChild(1)}
              duration={t.duration}
              className="mt-3 flex items-center gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={AVATARS.aisha}
                alt=""
                className="size-11 rounded-full object-cover ring-2 ring-primary/20"
                width={44}
                height={44}
              />
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold tracking-tight">
                  Aisha Patel
                </p>
                <p className="truncate text-xs text-primary">
                  Product Engineer
                </p>
              </div>
            </Beat>
            <Beat
              delay={t.profileChild(2)}
              duration={t.duration}
              as="p"
              className="mt-3 text-xs leading-relaxed text-muted-foreground"
            >
              Ships channel UX and realtime presence. IST · Northwind
            </Beat>
            <Beat
              delay={t.profileChild(3)}
              duration={t.duration}
              as="p"
              className="mt-3 text-xs font-medium text-muted-foreground"
            >
              View profile →
            </Beat>
          </Beat>

          <Beat
            delay={t.aiParent}
            duration={t.duration}
            as="section"
            className="bg-brand-wash flex flex-col rounded-xl border border-primary/20 bg-secondary/55 p-3.5 sm:p-4 lg:flex-1"
          >
            <Beat
              delay={t.aiChild(0)}
              duration={t.duration}
              className="flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span className="font-heading text-sm font-semibold tracking-tight">
                Channel AI
              </span>
            </Beat>
            <Beat
              delay={t.aiChild(1)}
              duration={t.duration}
              as="p"
              className="mt-1 text-[11px] text-muted-foreground"
            >
              Reads chat + shared links
            </Beat>
            <Beat
              delay={t.aiChild(2)}
              duration={t.duration}
              as="p"
              className="mt-4 text-xs font-semibold text-foreground"
            >
              Catch-up · last 7 days
            </Beat>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <Beat delay={t.aiChild(3)} duration={t.duration} as="li">
                Sync today at 10am
              </Beat>
              <Beat delay={t.aiChild(4)} duration={t.duration} as="li">
                Friday deploy · runbook linked
              </Beat>
              {band ? (
                <Beat delay={t.aiChild(5)} duration={t.duration} as="li">
                  1 linked page used for context
                </Beat>
              ) : null}
            </ul>
            <Beat
              delay={t.aiChild(band ? 6 : 5)}
              duration={t.duration}
              as="span"
              className="btn-brand-gradient mt-5 inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-white"
            >
              <Sparkles className="size-3" />
              Summarize
            </Beat>
          </Beat>
        </div>
      </div>
    </div>
  )
}

function WorkspaceItem({
  initials,
  name,
  role,
  active,
  delay,
  duration,
}: {
  initials: string
  name: string
  role: string
  active?: boolean
  delay: number
  duration: number
}) {
  return (
    <Beat
      delay={delay}
      duration={duration}
      x={-5}
      as="li"
      className={cn(
        "flex items-center gap-2 rounded-lg px-1 py-1",
        active && "bg-primary/[0.04]"
      )}
    >
      <span className="brand-tile flex size-7 shrink-0 items-center justify-center rounded-md font-heading text-[10px] font-semibold tracking-tight">
        {initials}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          active ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "shrink-0 text-[10px] font-medium capitalize",
          active ? "text-primary/75" : "text-muted-foreground/80"
        )}
      >
        {role}
      </span>
    </Beat>
  )
}

function ChatLine({
  src,
  name,
  body,
  attachment,
  linkPreview,
  delay,
  duration,
}: {
  src: string
  name: string
  body: string
  attachment?: boolean
  linkPreview?: { host: string; title: string }
  delay: number
  duration: number
}) {
  return (
    <Beat delay={delay} duration={duration} y={6} className="flex gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
        width={32}
        height={32}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {body}
        </p>
        {linkPreview ? (
          <div className="mt-1.5 max-w-[16rem] overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm ring-1 ring-foreground/5">
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-2.5 py-1.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-card ring-1 ring-border/70">
                <Globe className="size-3 text-primary" strokeWidth={1.75} />
              </span>
              <span className="truncate text-[9px] font-medium tracking-wide text-muted-foreground uppercase">
                {linkPreview.host}
              </span>
            </div>
            <p className="px-2.5 py-2 font-heading text-[11px] leading-snug font-semibold tracking-tight text-foreground">
              {linkPreview.title}
            </p>
          </div>
        ) : null}
        {attachment ? (
          <div className="mt-1.5 inline-flex items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1">
            <span className="size-6 rounded bg-secondary" />
            <span className="text-[10px] font-medium">dashboard.png</span>
          </div>
        ) : null}
      </div>
    </Beat>
  )
}
