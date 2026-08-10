"use client"

import { cn } from "@/lib/utils"

type UserAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClass = {
  sm: "size-7 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-16 text-lg",
}

/**
 * Letter initials or signed avatar image.
 */
export default function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase() || "?"

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
        className
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}
