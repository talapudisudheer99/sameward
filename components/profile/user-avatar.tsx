"use client"

import { workspaceInitials } from "@/components/workspace/workspace-display"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
  /** Extra classes on the initials fallback (e.g. brand tile color) */
  fallbackClassName?: string
}

const sizeClass = {
  sm: "size-7 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-16 text-lg",
}

/**
 * Photo when `avatarUrl` is set; otherwise letter initials.
 */
export default function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = workspaceInitials(name || "?") || "?"

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizeClass[size],
          className
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground",
        sizeClass[size],
        fallbackClassName,
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
