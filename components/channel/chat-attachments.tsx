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
        "flex flex-col gap-1.5",
        mine ? "items-end" : "items-start"
      )}
    >
      {images.length > 0 ? (
        <ImageGrid images={images} onOpen={setOpenIndex} mine={mine} />
      ) : null}

      {files.map((file) => (
        <FileCard key={file.url} file={file} mine={mine} />
      ))}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null)
        }}
      >
        <DialogContent
          showCloseButton
          className="w-full gap-2 bg-transparent p-0 shadow-none ring-0 sm:max-w-3xl"
        >
          <DialogTitle className="sr-only">
            {current?.name ?? "Image"}
          </DialogTitle>

          <div className="relative flex items-center justify-center">
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt={current.name}
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : null}

            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full opacity-90"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full opacity-90"
                  onClick={() => step(1)}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-popover px-3 py-2 text-popover-foreground">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {current?.name}
            </span>
            {images.length > 1 ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                {(openIndex ?? 0) + 1} / {images.length}
              </span>
            ) : null}
            {current ? (
              <span className="flex shrink-0 items-center gap-1">
                <a
                  href={current.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => downloadAttachment(current.url, current.name)}
                  className="text-muted-foreground hover:text-foreground"
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

  // Single image — natural, capped height
  if (count === 1) {
    return (
      <button
        type="button"
        onClick={() => onOpen(0)}
        className={cn(
          "block w-64 max-w-full overflow-hidden rounded-xl border border-border transition hover:brightness-95",
          mine && "border-primary/30"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]!.url}
          alt={images[0]!.name}
          className="max-h-72 w-full object-cover"
        />
      </button>
    )
  }

  // 2 up — side by side squares
  if (count === 2) {
    return (
      <div
        className={cn(
          "grid w-64 max-w-full grid-cols-2 gap-1 overflow-hidden rounded-xl border border-border",
          mine && "border-primary/30"
        )}
      >
        {images.map((img, i) => (
          <GridTile key={img.url} img={img} onClick={() => onOpen(i)} square />
        ))}
      </div>
    )
  }

  // 3 up — one tall on the left, two stacked on the right
  return (
    <div
      className={cn(
        "grid h-56 w-64 max-w-full grid-cols-2 grid-rows-2 gap-1 overflow-hidden rounded-xl border border-border",
        mine && "border-primary/30"
      )}
    >
      <GridTile
        img={images[0]!}
        onClick={() => onOpen(0)}
        className="row-span-2"
      />
      <GridTile img={images[1]!} onClick={() => onOpen(1)} />
      <GridTile img={images[2]!} onClick={() => onOpen(2)} />
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
        "relative overflow-hidden transition hover:brightness-95",
        square && "aspect-square",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.name}
        className="h-full w-full object-cover"
      />
    </button>
  )
}

function FileCard({ file, mine }: { file: Attachment; mine?: boolean }) {
  const isPdf = file.mime === "application/pdf"
  return (
    <div
      className={cn(
        "flex w-64 max-w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition hover:bg-muted",
        mine && "border-primary/30"
      )}
    >
      {/* Preview: open in a new tab (PDFs/images render in-browser) */}
      <a
        href={file.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3"
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
        <span className="min-w-0 flex-1">
          <OverflowText className="text-sm font-medium text-foreground">
            {file.name}
          </OverflowText>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {isPdf ? "PDF" : file.mime.split("/")[1]?.toUpperCase()} ·{" "}
            {formatBytes(file.sizeBytes)}
          </span>
        </span>
      </a>

      {/* Real download (fetch → blob → save) */}
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
