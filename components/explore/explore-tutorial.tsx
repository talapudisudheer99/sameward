"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { CSSProperties } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  EXPLORE_TUTORIAL_STEPS,
  type ExploreTutorialStep,
  type ExploreTutorialStepId,
} from "@/lib/explore/explore-tutorial-steps"

type Rect = { top: number; left: number; width: number; height: number }

type ExploreTutorialProps = {
  open: boolean
  stepIndex: number
  onStepChange: (index: number) => void
  onStepEnter?: (step: ExploreTutorialStep) => void
  onSkip: () => void
  onComplete: () => void
}

function measureTarget(selector: string | undefined): Rect | null {
  if (!selector || typeof document === "undefined") return null
  const el = document.querySelector(selector)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  const pad = 6
  return {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  }
}

/**
 * First-visit walkthrough for /explore — spotlight + Next / Skip.
 */
export default function ExploreTutorial({
  open,
  stepIndex,
  onStepChange,
  onStepEnter,
  onSkip,
  onComplete,
}: ExploreTutorialProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [mounted, setMounted] = useState(false)

  const step = EXPLORE_TUTORIAL_STEPS[stepIndex]
  const isLast = stepIndex >= EXPLORE_TUTORIAL_STEPS.length - 1
  const isCenter = !step?.target || step.placement === "center"

  const remeasure = useCallback(() => {
    if (!open || !step) {
      setRect(null)
      return
    }
    setRect(measureTarget(step.target))
  }, [open, step])

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !step) return
    onStepEnter?.(step)
    remeasure()
    const t = window.setTimeout(remeasure, 120)
    return () => window.clearTimeout(t)
  }, [open, step, stepIndex, onStepEnter, remeasure])

  useEffect(() => {
    if (!open) return
    window.addEventListener("resize", remeasure)
    window.addEventListener("scroll", remeasure, true)
    return () => {
      window.removeEventListener("resize", remeasure)
      window.removeEventListener("scroll", remeasure, true)
    }
  }, [open, remeasure])

  if (!mounted || !open || !step) return null

  function goNext() {
    if (isLast) {
      onComplete()
      return
    }
    onStepChange(stepIndex + 1)
  }

  const card = (
    <div
      className={cn(
        "pointer-events-auto z-[70] w-[min(calc(100vw-2rem),22rem)] rounded-[var(--radius)] border border-border bg-card p-4 shadow-xl",
        isCenter && "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      )}
      style={
        !isCenter && rect
          ? cardPosition(rect, step.placement ?? "bottom")
          : undefined
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-tutorial-title"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Step {stepIndex + 1} of {EXPLORE_TUTORIAL_STEPS.length}
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Skip tour"
        >
          <X className="size-4" />
        </button>
      </div>
      <h2
        id="explore-tutorial-title"
        className="font-heading text-base font-semibold tracking-tight"
      >
        {step.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {step.body}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
          Skip tour
        </Button>
        <Button
          type="button"
          size="sm"
          className="btn-brand-gradient min-w-20"
          onClick={goNext}
        >
          {isLast ? "Done" : "Next"}
        </Button>
      </div>
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[60]" aria-hidden={false}>
      {/* Backdrop with spotlight cutout */}
      {isCenter ? (
        <div
          className="absolute inset-0 bg-black/55"
          onClick={onSkip}
          aria-hidden
        />
      ) : rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/55" aria-hidden />
      )}

      {card}
    </div>,
    document.body
  )
}

function cardPosition(
  rect: Rect,
  placement: ExploreTutorialStep["placement"]
): CSSProperties {
  const gap = 12
  const maxW = 352

  switch (placement) {
    case "top":
      return {
        position: "fixed",
        left: clamp(rect.left + rect.width / 2 - maxW / 2, 16, window.innerWidth - maxW - 16),
        top: Math.max(16, rect.top - gap),
        transform: "translateY(-100%)",
      }
    case "left":
      return {
        position: "fixed",
        left: Math.max(16, rect.left - gap - maxW),
        top: clamp(rect.top, 16, window.innerHeight - 200),
      }
    case "right":
      return {
        position: "fixed",
        left: Math.min(
          window.innerWidth - maxW - 16,
          rect.left + rect.width + gap
        ),
        top: clamp(rect.top, 16, window.innerHeight - 200),
      }
    case "bottom":
    default:
      return {
        position: "fixed",
        left: clamp(rect.left + rect.width / 2 - maxW / 2, 16, window.innerWidth - maxW - 16),
        top: rect.top + rect.height + gap,
      }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export type { ExploreTutorialStepId }
