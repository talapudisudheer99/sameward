import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

type CancelButtonProps = {
  className?: string
  text?: string
  onClick: () => void
}

const CancelButton = ({
  className,
  text = "Cancel",
  onClick,
}: CancelButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("h-10", className)}
      onClick={onClick}
    >
      {text}
    </Button>
  )
}

export default CancelButton
