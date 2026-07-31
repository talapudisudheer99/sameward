import { cn } from "@/lib/utils"

/**
 * Shared overflow strategies for user-generated strings (workspace names, emails, etc.).
 * Prefer OverflowText component; use these classes when you must style a Link/asChild.
 *
 * Flex rule: any truncated child needs a parent with `min-w-0`.
 */
export const overflowTextVariants = {
  /** One line + ellipsis. Hover via title shows full text. */
  ellipsis: "min-w-0 truncate",
  /** Page titles: wrap long tokens, cap at 2 lines */
  title:
    "min-w-0 max-w-full break-words [overflow-wrap:anywhere] line-clamp-2",
  /** Body / descriptions that may include long names */
  wrap: "min-w-0 max-w-full break-words [overflow-wrap:anywhere]",
} as const

export type OverflowTextVariant = keyof typeof overflowTextVariants

export function overflowTextClass(
  variant: OverflowTextVariant,
  className?: string
) {
  return cn(overflowTextVariants[variant], className)
}
