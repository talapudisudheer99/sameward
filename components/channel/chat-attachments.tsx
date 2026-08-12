"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import OverflowText from "@/components/sharable/overflow-text"
import { cn } from "@/lib/utils"
import type { Attachment } from "@/lib/types/upload/upload-types"

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const isImage = (a: Attachment) => a.mime.startsWith("image/")

/**
 * Force a real "Save file" instead of a new-tab redirect. The `download`
 * attribute is ignored on cross-origin (S3) URLs, so we fetch the bytes as a
 * blob (bucket CORS allows GET) and download that object URL.
 */
async function downloadAttachment(url: string, name: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  } catch {
    toast.error("Could not download file")
  }
}

type ChatAttachmentsProps = {
  attachments: Attachment[]
  mine?: boolean
}

/**
 * Renders a message's attachments: images as a 1/2/3-up grid (click → lightbox
 * with prev/next), other files (e.g. PDF) as tappable file cards.
 */
export default function ChatAttachments({
  attachments,
  mine,
}: ChatAttachmentsProps) {
  const images = attachments.filter(isImage)
  const files = attachments.filter((a) => !isImage(a))

  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isOpen = openIndex !== null

  const step = (delta: number) => {
    setOpenIndex((i) =>
      i === null ? i : (i + delta + images.length) % images.length
    )
  }

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length])

  const current = openIndex !== null ? images[openIndex] : null

  return (
    <div
      className={cn(
        "flex w-full max-w-full min-w-0 flex-col gap-1.5",
        mine ? "items-end" : "items-start"
      )}
    >
      {images.length > 0 ? (
        <ImageGrid images={images} onOpen={setOpenIndex} mine={mine} />
      ) : null}

      {files.map((file) => (
        <FileCard key={file.url} file={file} mine={mine} />
      ))}

      {/* Light surface lightbox — soft overlay, no black chrome frame */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null)
        }}
      >
        <DialogContent
          showCloseButton
          overlayClassName="bg-black/50 backdrop-blur-[2px]"
          className={cn(
            "gap-0 overflow-hidden border-border bg-card p-0 text-foreground shadow-xl",
            "w-[min(100%-1.5rem,36rem)] max-w-[min(100%-1.5rem,36rem)] sm:max-w-xl"
          )}
        >
          <DialogTitle className="sr-only">
            {current?.name ?? "Image"}
          </DialogTitle>

          <div className="relative flex max-h-[min(72vh,34rem)] min-h-44 items-center justify-center bg-muted/50">
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt={current.name}
                className="max-h-[min(70vh,32rem)] w-auto max-w-full object-contain"
              />
            ) : null}

            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-1/2 left-1.5 -translate-y-1/2 rounded-full border border-border/60 bg-card/95 shadow-sm sm:left-2"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full border border-border/60 bg-card/95 shadow-sm sm:right-2"
                  onClick={() => step(1)}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            ) : null}
          </div>

          <div className="flex min-w-0 items-center gap-2 border-t border-border bg-card px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground sm:text-sm">
              {current?.name}
            </span>
            {images.length > 1 ? (
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {(openIndex ?? 0) + 1}/{images.length}
              </span>
            ) : null}
            {current ? (
              <span className="flex shrink-0 items-center gap-0.5">
                <a
                  href={current.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => downloadAttachment(current.url, current.name)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Download"
                >
                  <Download className="size-4" />
                </button>
              </span>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Shared width: never wider than the bubble / viewport */
const gridShell =
  "w-full max-w-[min(100%,14rem)] overflow-hidden rounded-2xl border border-border sm:max-w-[17rem]"

function ImageGrid({
  images,
  onOpen,
  mine,
}: {
  images: Attachment[]
  onOpen: (i: number) => void
  mine?: boolean
}) {
  const count = images.length

  if (count === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className={cn(
          gridShell,
          "group block bg-muted/30 transition hover:brightness-[0.97]",
          mine && "border-primary/30"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]!.url}
          alt={images[0]!.name}
          className="max-h-56 w-full object-cover sm:max-h-72"
        />
      </button>
    )
  }

  if (count === 2) {
    return (
      <div
        className={cn(
          gridShell,
          "grid grid-cols-2 gap-0.5 bg-border",
          mine && "border-primary/30"
        )}
      >
        {images.map((img, i) => (
          <GridTile key={img.url} img={img} onClick={() => onOpen(i)} square />
        ))}
      </div>
    )
  }

  // 3 — collage from sm up; stacked strip on very narrow chat columns
  return (
    <div
      className={cn(
        gridShell,
        "flex flex-col gap-0.5 bg-border sm:grid sm:h-56 sm:grid-cols-2 sm:grid-rows-2 sm:gap-0.5",
        mine && "border-primary/30"
      )}
    >
      <GridTile
        img={images[0]!}
        onClick={() => onOpen(0)}
        className="h-36 min-h-0 sm:row-span-2 sm:h-auto"
      />
      <GridTile
        img={images[1]!}
        onClick={() => onOpen(1)}
        className="h-28 min-h-0 sm:h-auto"
      />
      <GridTile
        img={images[2]!}
        onClick={() => onOpen(2)}
        className="h-28 min-h-0 sm:h-auto"
      />
    </div>
  )
}

function GridTile({
  img,
  onClick,
  square,
  className,
}: {
  img: Attachment
  onClick: () => void
  square?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative h-full min-h-0 w-full overflow-hidden bg-muted",
        square && "aspect-square",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.name}
        className="h-full w-full object-cover transition duration-200 group-hover:brightness-95"
      />
    </button>
  )
}

function FileCard({ file, mine }: { file: Attachment; mine?: boolean }) {
  const isPdf = file.mime === "application/pdf"
  return (
    <div
      className={cn(
        "flex w-full max-w-[min(100%,14rem)] items-center gap-2 overflow-hidden rounded-xl border border-border bg-card px-3 py-2.5 transition hover:bg-muted sm:max-w-[17rem]",
        mine && "border-primary/30"
      )}
    >
      <a
        href={file.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isPdf ? "bg-destructive/10 text-destructive" : "brand-tile"
          )}
          aria-hidden
        >
          <FileText className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1 overflow-hidden">
          <OverflowText className="block w-full text-sm font-medium text-foreground">
            {file.name}
          </OverflowText>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {isPdf ? "PDF" : file.mime.split("/")[1]?.toUpperCase()} ·{" "}
            {formatBytes(file.sizeBytes)}
          </span>
        </span>
      </a>

      <button
        type="button"
        onClick={() => downloadAttachment(file.url, file.name)}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
        aria-label={`Download ${file.name}`}
      >
        <Download className="size-4" />
      </button>
    </div>
  )
}
