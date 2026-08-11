"use client"

import { useLayoutEffect, type RefObject } from "react"

/**
 * WhatsApp-style autosize: grow with content up to maxHeightPx, then scroll.
 * Uses the classic scrollHeight reset (works in all modern browsers;
 * CSS `field-sizing: content` is still incomplete in Safari/Firefox).
 */
export function useAutosizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeightPx = 160
): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.height = "0px"
    const next = Math.min(el.scrollHeight, maxHeightPx)
    el.style.height = `${next}px`
    el.style.overflowY = el.scrollHeight > maxHeightPx ? "auto" : "hidden"
  }, [ref, value, maxHeightPx])
}
