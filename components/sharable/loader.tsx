import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

type LoaderProps = {
  className?: string
  /** Centered spinner for page/section loading states */
  fullPage?: boolean
}

/**
 * Spinner — default size fits buttons; `fullPage` wraps the centered page state.
 */
const Loader = ({ className, fullPage = false }: LoaderProps) => {
  const spinner = (
    <Loader2
      className={cn(
        "animate-spin",
        fullPage
          ? "size-6 text-muted-foreground"
          : "mr-2 h-4 w-4",
        className
      )}
    />
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Loader
