import { cn } from "@/lib/utils"

type TeamHubLogoProps = {
  className?: string
  /** mark = icon only · horizontal = icon + wordmark · stacked = icon above wordmark */
  variant?: "mark" | "horizontal" | "stacked"
  /** Pixel height of the mark (wordmark scales with it). */
  size?: number
  /** Accessible name when logo is the sole content of a link */
  title?: string
  /** onDark = white “TeamHub” for navy/marketing panels */
  tone?: "default" | "onDark"
}

function LogoMark({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="teamhub-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--primary)" }} />
        </linearGradient>
      </defs>

      {/* Soft rounded squircle container — no sharp edges */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="9"
        fill="url(#teamhub-mark)"
      />

      {/* left */}
      <circle cx="9.8" cy="12.8" r="2" className="fill-primary-foreground" />
      <path
        d="M6.2 20.6c0-1.9 1.6-3.2 3.6-3.2s3.6 1.3 3.6 3.2v.35H6.2v-.35Z"
        className="fill-primary-foreground"
      />
      {/* right */}
      <circle cx="22.2" cy="12.8" r="2" className="fill-primary-foreground" />
      <path
        d="M18.6 20.6c0-1.9 1.6-3.2 3.6-3.2s3.6 1.3 3.6 3.2v.35h-7.2v-.35Z"
        className="fill-primary-foreground"
      />
      {/* center + stem */}
      <circle cx="16" cy="11.6" r="2.4" className="fill-primary-foreground" />
      <path
        d="M11.8 21c0-2.3 1.9-3.85 4.2-3.85S20.2 18.7 20.2 21v.4h-8.4V21Z"
        className="fill-primary-foreground"
      />
      <rect
        x="15.2"
        y="21.1"
        width="1.6"
        height="3.4"
        rx="0.8"
        className="fill-primary-foreground"
      />
    </svg>
  )
}

/**
 * TeamHub AI brand mark — soft rounded squircle + team silhouettes.
 * Gradient (--brand-a → --primary) is theme-aware and follows the palette.
 */
export function TeamHubLogo({
  className,
  variant = "mark",
  size = 28,
  title = "TeamHub AI",
  tone = "default",
}: TeamHubLogoProps) {
  if (variant === "mark") {
    return (
      <span
        className={cn("inline-flex shrink-0", className)}
        role="img"
        aria-label={title}
      >
        <LogoMark size={size} />
      </span>
    )
  }

  const hubClass =
    tone === "onDark"
      ? "font-semibold text-white"
      : "font-semibold text-foreground"

  const wordmark = (
    <span className="font-heading tracking-tight">
      <span className={hubClass}>TeamHub</span>{" "}
      <span className="font-semibold text-primary">AI</span>
    </span>
  )

  if (variant === "stacked") {
    return (
      <span
        className={cn("inline-flex flex-col items-center gap-1.5", className)}
        role="img"
        aria-label={title}
      >
        <LogoMark size={size} />
        <span className="text-center text-sm leading-tight">{wordmark}</span>
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={title}
      style={{ fontSize: Math.max(13, Math.round(size * 0.5)) }}
    >
      <LogoMark size={size} />
      {wordmark}
    </span>
  )
}
