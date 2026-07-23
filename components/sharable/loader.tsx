import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"


type LoaderProps = {
    className?: string,
}

const Loader = ({ className }: LoaderProps) => { return <Loader2 className={cn("w-4 h-4 mr-2 animate-spin", className)} /> }

export default Loader