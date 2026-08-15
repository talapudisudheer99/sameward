"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAxiosError } from "axios"
import { ShieldOff } from "lucide-react"
import { toast } from "sonner"

import { buttonVariants } from "@/components/ui/button"
import { api } from "@/lib/api/axios"
import { cn } from "@/lib/utils"

/**
 * Lives in the app sidebar (not on a random page).
 *
 * Flow:
 * 1. POST /api/auth/logout-all  → deletes session rows + clears cookie
 * 2. router.replace("/login") → leave the protected area
 * 3. proxy would also bounce /workspace without a cookie — this is just cleaner UX
 */
export function LogoutAllDevicesButton({
  className,
  compact = false,
}: {
  className?: string
  /** Tighter sizing for use inside the sidebar account menu */
  compact?: boolean
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onLogout = async () => {
    try {
      setIsLoading(true)
      await api.post("/api/auth/logout-all")
      toast.success("Logged out from all devices")
      router.replace("/login")
      router.refresh()
    } catch (error) {
      let message

      if (isAxiosError(error)) {
        message =
          error.response?.data?.message ?? "Could not log out from all devices"
      } else {
        message = "Unable to reach the server. Please try again."
      }

      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoading}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start gap-2 rounded-[var(--radius)] text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ShieldOff
        className={compact ? "size-4" : "size-5"}
        data-icon="inline-start"
      />
      <span className={cn("font-medium", compact ? "text-[13px]" : "text-sm")}>
        {isLoading ? "Logging out…" : "Log out all devices"}
      </span>
    </button>
  )
}
