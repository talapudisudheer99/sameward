"use client"

type TypingIndicatorProps = {
  /** e.g. "Priya" or "Priya and Rahul" — parent formats */
  label: string | null
}

export default function TypingIndicator({ label }: TypingIndicatorProps) {
  if (!label) return null

  return (
    <p className="flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground">
      <span className="inline-flex gap-0.5" aria-hidden>
        <span className="size-1 animate-pulse rounded-full bg-primary" />
        <span className="size-1 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
        <span className="size-1 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
      </span>
      {label} is typing…
    </p>
  )
}
