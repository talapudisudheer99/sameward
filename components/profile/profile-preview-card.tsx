"use client"

import type { ReactNode } from "react"
import { Clock, ExternalLink, Mail } from "lucide-react"

import UserAvatar from "@/components/profile/user-avatar"
import {
  timezoneLocalTime,
  timezoneOffsetLabel,
} from "@/lib/profile/timezones"
import type { ProfileLink } from "@/lib/types/profile/profile-types"
import { cn } from "@/lib/utils"

type ProfilePreviewCardProps = {
  fullName: string
  email: string
  title: string
  bio: string
  timezone: string
  links: ProfileLink[]
  avatarUrl: string | null
}

const STRENGTH_LABELS = ["Empty", "Sparse", "Getting there", "Solid", "Complete"]

/** Only link out for real http(s) URLs — the field can be mid-typing. */
function safeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:"
    return isHttp ? parsed.toString() : null
  } catch {
    return null
  }
}

/**
 * Mirrors the teammate card in `ProfileCardDialog`, but driven by unsaved form
 * state — so people can see what they are publishing while they write it.
 */
export default function ProfilePreviewCard({
  fullName,
  email,
  title,
  bio,
  timezone,
  links,
  avatarUrl,
}: ProfilePreviewCardProps) {
  const name = fullName.trim()
  const role = title.trim()
  const about = bio.trim()
  const zone = timezone.trim()
  const shownLinks = links.filter((l) => l.label.trim() && l.url.trim())

  const offset = zone ? timezoneOffsetLabel(zone) : null
  const localTime = zone ? timezoneLocalTime(zone) : null
  // A zone only "counts" when it's a real IANA zone (offset resolves).
  const validZone = offset !== null

  const filled = [
    Boolean(avatarUrl),
    Boolean(name),
    Boolean(role),
    Boolean(about),
    validZone,
    shownLinks.length > 0,
  ].filter(Boolean).length
  const pct = Math.round((filled / 6) * 100)
  const strength = STRENGTH_LABELS[Math.min(4, Math.floor(filled / 1.5))]

  let timezoneDisplay: ReactNode
  if (!zone) {
    timezoneDisplay = (
      <span className="text-muted-foreground/55 italic">No timezone set</span>
    )
  } else if (validZone) {
    timezoneDisplay = (
      <>
        <span className="font-medium">{zone}</span>
        {localTime ? (
          <span className="text-muted-foreground">
            {" · "}
            {localTime}
            {offset ? ` (${offset})` : ""}
          </span>
        ) : null}
      </>
    )
  } else {
    timezoneDisplay = (
      <span className="text-muted-foreground/55 italic">
        {zone} — not recognized
      </span>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold tracking-tight text-foreground">
        Teammate preview
      </p>

      <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-primary/5">
        <div className="flex items-start gap-3">
          <UserAvatar name={name || "?"} avatarUrl={avatarUrl} size="lg" />
          <div className="min-w-0 flex-1 pt-0.5">
            <p
              className={cn(
                "truncate font-heading text-lg font-semibold tracking-tight",
                !name && "text-muted-foreground/60"
              )}
            >
              {name || "Your name"}
            </p>
            {role ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {role}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-muted-foreground/55 italic">
                Add a title so teammates know your role
              </p>
            )}
          </div>
        </div>

        {about ? (
          <p className="mt-3.5 text-sm leading-relaxed text-foreground/90">
            {about}
          </p>
        ) : (
          <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground/55 italic">
            Your bio shows here — one or two lines about how you work.
          </p>
        )}

        <dl className="mt-3.5 space-y-2 border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <dt className="sr-only">Email</dt>
            <dd className="min-w-0 truncate font-medium">{email}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <dt className="sr-only">Timezone</dt>
            <dd className="min-w-0 truncate">{timezoneDisplay}</dd>
          </div>
        </dl>

        {shownLinks.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-3">
            {shownLinks.map((link, i) => {
              const href = safeHttpUrl(link.url)
              return (
                <li key={`${link.url}-${i}`} className="min-w-0">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 truncate text-xs font-medium text-primary hover:underline"
                    >
                      {link.label.trim()}
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-muted-foreground/55 italic">
                      {link.label.trim()} — needs a valid https:// URL
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/35 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-foreground/80">
            Profile strength
          </p>
          <p className="text-xs text-muted-foreground">{strength}</p>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completeness"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {filled} of 6 details added
        </p>
      </div>
    </div>
  )
}
