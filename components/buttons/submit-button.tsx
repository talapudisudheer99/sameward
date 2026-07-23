import { Button } from "@/components/ui/button"
import Loader from "@/components/sharable/loader"
import { cn } from "@/lib/utils"

type SubmitButtonProps = {
  type?: "submit" | "button"
  disabled?: boolean
  isLoading?: boolean
  className?: string
  text?: string
}

export default function SubmitButton({
  type = "submit",
  disabled,
  isLoading,
  className,
  text = "Submit",
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "flex h-10 items-center justify-center gap-2",
        className
      )}
    >
      {isLoading ? <Loader className="size-4" /> : null}
      {isLoading ? "Please wait…" : text}
    </Button>
  )
}
