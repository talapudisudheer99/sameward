"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

const OPTIONS = [
  { id: "light" as const, label: "Light", Icon: Sun },
  { id: "dark" as const, label: "Dark", Icon: Moon },
  { id: "system" as const, label: "System", Icon: Monitor },
]

/**
 * Appearance — Light / Dark / System (next-themes).
 */
export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const active = mounted ? (theme ?? "system") : "system"

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ id, label, Icon }) => {
        const selected = active === id
        return (
          <button
            key={id}
            type="button"
            disabled={!mounted}
            onClick={() => setTheme(id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            aria-pressed={selected}
          >
            <Icon className="size-4" aria-hidden />
            <span className="font-medium">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
