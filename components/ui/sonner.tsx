"use client"

import type { CSSProperties } from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

/**
 * Sameward-branded Sonner toaster — Ocean Blue surfaces, not default green/red richColors.
 */
const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group", className)}
      position="top-right"
      closeButton
      expand
      gap={12}
      visibleToasts={4}
      offset={16}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[var(--toast-icon)]" />
        ),
        info: <InfoIcon className="size-4 text-[var(--toast-icon)]" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-[var(--toast-icon)]" />
        ),
        error: <OctagonXIcon className="size-4 text-[var(--toast-icon)]" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-[var(--toast-icon)]" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: cn("teamhub-toast", toastOptions?.classNames?.toast),
          title: cn(
            "font-heading text-sm font-semibold tracking-tight",
            toastOptions?.classNames?.title
          ),
          description: cn(
            "text-xs leading-relaxed text-muted-foreground",
            toastOptions?.classNames?.description
          ),
          actionButton: cn(
            "btn-brand-gradient !rounded-md !border-0 !px-3 !py-1.5 !text-xs !font-semibold !text-white",
            toastOptions?.classNames?.actionButton
          ),
          cancelButton: cn(
            "!rounded-md !border !border-border !bg-muted !px-3 !py-1.5 !text-xs !font-medium !text-muted-foreground",
            toastOptions?.classNames?.cancelButton
          ),
          closeButton: cn(
            "teamhub-toast-close",
            toastOptions?.classNames?.closeButton
          ),
          success: cn(
            "teamhub-toast-success",
            toastOptions?.classNames?.success
          ),
          error: cn("teamhub-toast-error", toastOptions?.classNames?.error),
          warning: cn(
            "teamhub-toast-warning",
            toastOptions?.classNames?.warning
          ),
          info: cn("teamhub-toast-info", toastOptions?.classNames?.info),
          loading: cn("teamhub-toast-info", toastOptions?.classNames?.loading),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
