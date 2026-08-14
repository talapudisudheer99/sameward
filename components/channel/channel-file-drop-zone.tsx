"use client"

import {
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react"
import { Paperclip } from "lucide-react"

import { cn } from "@/lib/utils"

function dragHasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files")
}

type ChannelFileDropZoneProps = {
  disabled?: boolean
  onFiles: (files: File[]) => void
  children: ReactNode
  className?: string
}

/**
 * WhatsApp-style channel drop target — drag files anywhere over the chat
 * column (transcript + composer), not only the input.
 */
export default function ChannelFileDropZone({
  disabled = false,
  onFiles,
  children,
  className,
}: ChannelFileDropZoneProps) {
  const depthRef = useRef(0)
  const [active, setActive] = useState(false)

  function clearDrag() {
    depthRef.current = 0
    setActive(false)
  }

  function onDragEnter(e: DragEvent) {
    if (disabled || !dragHasFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    depthRef.current += 1
    setActive(true)
  }

  function onDragLeave(e: DragEvent) {
    if (disabled || !dragHasFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    depthRef.current = Math.max(0, depthRef.current - 1)
    if (depthRef.current === 0) setActive(false)
  }

  function onDragOver(e: DragEvent) {
    if (disabled || !dragHasFiles(e)) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
  }

  function onDrop(e: DragEvent) {
    if (disabled) return
    if (!dragHasFiles(e)) {
      clearDrag()
      return
    }
    e.preventDefault()
    e.stopPropagation()
    clearDrag()
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length > 0) onFiles(files)
  }

  return (
    <div
      className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}

      {active ? (
        <div
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-background/80 p-6 backdrop-blur-[2px]"
          aria-hidden
        >
          <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-card px-8 py-10 text-center shadow-lg ring-1 ring-primary/15">
            <span className="brand-tile flex size-12 items-center justify-center rounded-xl">
              <Paperclip className="size-5 text-primary" strokeWidth={1.75} />
            </span>
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              Drop files to attach
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Images &amp; PDF · up to 3 files · 10 MB each
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
