import { cn } from "@/lib/utils"

type TeamHubLogoProps = {
  className?: string
}

/** Simple mark for Phase 1 — replace later with a real brand asset if needed. */
export function TeamHubLogo({ className }: TeamHubLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M8 11h6.5a3.5 3.5 0 0 1 0 7H8V11Zm0 0V21M18.5 11H24v3.5h-5.5V11Zm0 6.5H24V21h-5.5v-3.5Z"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
