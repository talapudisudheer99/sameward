"use client"

import { useEffect, useMemo, useState } from "react"

import { extractUrlsFromTexts } from "@/lib/ai/extract-urls"
import type { LinkPreview } from "@/lib/types/channel/link-preview"

type UseComposerLinkPreviewArgs = {
  body: string
  workspaceId?: string
  channelId?: string
  disabled?: boolean
}

/**
 * Debounced live OG card for the composer (WhatsApp-style).
 */
export function useComposerLinkPreview({
  body,
  workspaceId,
  channelId,
  disabled,
}: UseComposerLinkPreviewArgs) {
  const [composerPreview, setComposerPreview] = useState<LinkPreview | null>(
    null
  )
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dismissedPreviewUrl, setDismissedPreviewUrl] = useState<string | null>(
    null
  )

  const detectedUrl = useMemo(() => {
    const urls = extractUrlsFromTexts([body], 1)
    return urls[0] ?? null
  }, [body])

  useEffect(() => {
    if (!workspaceId || !channelId || disabled) {
      setComposerPreview(null)
      setPreviewLoading(false)
      return
    }
    if (!detectedUrl || detectedUrl === dismissedPreviewUrl) {
      setComposerPreview(null)
      setPreviewLoading(false)
      return
    }

    let cancelled = false
    setPreviewLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/channels/${channelId}/link-preview`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: detectedUrl }),
          }
        )
        if (cancelled) return
        if (!res.ok) {
          setComposerPreview(null)
          return
        }
        const data = (await res.json()) as { preview: LinkPreview | null }
        if (cancelled) return
        setComposerPreview(data.preview)
      } catch {
        if (!cancelled) setComposerPreview(null)
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [detectedUrl, dismissedPreviewUrl, workspaceId, channelId, disabled])

  useEffect(() => {
    if (!detectedUrl) setDismissedPreviewUrl(null)
  }, [detectedUrl])

  function dismissPreview() {
    if (!detectedUrl) return
    setDismissedPreviewUrl(detectedUrl)
    setComposerPreview(null)
  }

  function clearPreviewState() {
    setComposerPreview(null)
    setDismissedPreviewUrl(null)
  }

  const showPreview =
    Boolean(detectedUrl) &&
    detectedUrl !== dismissedPreviewUrl &&
    Boolean(composerPreview || previewLoading)

  return {
    detectedUrl,
    composerPreview,
    previewLoading,
    showPreview,
    dismissPreview,
    clearPreviewState,
  }
}
