import { cn } from "@/lib/utils"
import {
  overflowTextVariants,
  type OverflowTextVariant,
} from "@/lib/ui/overflow-text"

type OverflowTextProps = {
  children: string
  /**
   * ellipsis — single-line truncate (lists, breadcrumbs)
   * title — 2-line clamp + break long tokens (page headings)
   * wrap — full wrap with break-anywhere (body copy)
   */
  variant?: OverflowTextVariant
  as?: "span" | "p" | "h1" | "h2" | "h3"
  className?: string
  /** Native tooltip; defaults to full string for ellipsis */
  title?: string
}

/**
 * Safe display for user-generated text that can be long / unbroken.
 * Use everywhere we show workspace names, emails in tight layouts, etc.
 */
export default function OverflowText({
  children,
  variant = "ellipsis",
  as: Comp = "span",
  className,
  title,
}: OverflowTextProps) {
  const tip =
    title ?? (variant === "ellipsis" || variant === "title" ? children : undefined)

  return (
    <Comp className={cn(overflowTextVariants[variant], className)} title={tip}>
      {children}
    </Comp>
  )
}
